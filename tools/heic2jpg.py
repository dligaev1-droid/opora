"""Minimal HEIC (iPhone) decoder: parses ISOBMFF meta, extracts the HEVC grid tiles of the primary image,
decodes them with ffmpeg and stitches them with PIL. Applies irot/imir. Usage: heic2jpg.py in.heic out.jpg"""
import struct, subprocess, sys, os, tempfile
from PIL import Image

def boxes(d, start, end):
    i = start
    while i < end:
        size, typ = struct.unpack(">I4s", d[i:i+8]); hdr = 8
        if size == 1: size = struct.unpack(">Q", d[i+8:i+16])[0]; hdr = 16
        elif size == 0: size = end - i
        yield typ.decode("latin1"), i + hdr, i + size
        i += size

def fullbox(d, s): return d[s], int.from_bytes(d[s+1:s+4], "big"), s + 4

data = open(sys.argv[1], "rb").read()
meta = next((s, e) for t, s, e in boxes(data, 0, len(data)) if t == "meta")
v, f, ms = fullbox(data, meta[0])
sub = {t: (s, e) for t, s, e in boxes(data, ms, meta[1])}

# primary item
v, f, p = fullbox(data, sub["pitm"][0]); primary = struct.unpack(">H" if v == 0 else ">I", data[p:p+(2 if v == 0 else 4)])[0]

# item info
items = {}
v, f, p = fullbox(data, sub["iinf"][0])
n = struct.unpack(">H" if v == 0 else ">I", data[p:p+(2 if v == 0 else 4)])[0]; p += 2 if v == 0 else 4
for t, s, e in boxes(data, p, sub["iinf"][1]):
    iv, _, q = fullbox(data, s)
    if iv >= 2:
        iid = struct.unpack(">H" if iv == 2 else ">I", data[q:q+(2 if iv == 2 else 4)])[0]; q += 2 if iv == 2 else 4
        q += 2; items[iid] = data[q:q+4].decode("latin1")

# locations
loc = {}
v, f, p = fullbox(data, sub["iloc"][0])
a, b = data[p], data[p+1]; p += 2
osz, lsz, bsz, isz = a >> 4, a & 15, b >> 4, (b & 15 if v in (1, 2) else 0)
cnt = struct.unpack(">H" if v < 2 else ">I", data[p:p+(2 if v < 2 else 4)])[0]; p += 2 if v < 2 else 4
rd = lambda q, sz: (int.from_bytes(data[q:q+sz], "big") if sz else 0, q + sz)
for _ in range(cnt):
    iid, p = rd(p, 2 if v < 2 else 4)
    cm = 0
    if v in (1, 2): cm = data[p+1] & 15; p += 2
    p += 2
    base, p = rd(p, bsz)
    if cm == 1: base += sub["idat"][0]
    ec = struct.unpack(">H", data[p:p+2])[0]; p += 2
    ex = []
    for _ in range(ec):
        if isz: _, p = rd(p, isz)
        off, p = rd(p, osz); ln, p = rd(p, lsz); ex.append((base + off, ln))
    loc[iid] = ex
item_data = lambda iid: b"".join(data[o:o+l] for o, l in loc[iid])

# references
dimg = {}
if "iref" in sub:
    v, f, p = fullbox(data, sub["iref"][0])
    for t, s, e in boxes(data, p, sub["iref"][1]):
        fid = struct.unpack(">H" if v == 0 else ">I", data[s:s+(2 if v == 0 else 4)])[0]; q = s + (2 if v == 0 else 4)
        rc = struct.unpack(">H", data[q:q+2])[0]; q += 2
        refs = [struct.unpack(">H" if v == 0 else ">I", data[q+k*(2 if v == 0 else 4):q+(k+1)*(2 if v == 0 else 4)])[0] for k in range(rc)]
        if t == "dimg": dimg[fid] = refs

# properties
iprp = next((s, e) for t, s, e in boxes(data, *sub["iprp"]) if t == "ipco")
props = [(t, s, e) for t, s, e in boxes(data, *iprp)]
assoc = {}
for t, s, e in boxes(data, *sub["iprp"]):
    if t != "ipma": continue
    v, f, p = fullbox(data, s); ec = struct.unpack(">I", data[p:p+4])[0]; p += 4
    for _ in range(ec):
        iid = struct.unpack(">H" if v < 1 else ">I", data[p:p+(2 if v < 1 else 4)])[0]; p += 2 if v < 1 else 4
        c = data[p]; p += 1; lst = []
        for _ in range(c):
            if f & 1: x = struct.unpack(">H", data[p:p+2])[0] & 0x7FFF; p += 2
            else: x = data[p] & 0x7F; p += 1
            lst.append(x)
        assoc[iid] = lst
def prop(iid, typ):
    for x in assoc.get(iid, []):
        if x and props[x-1][0] == typ: return props[x-1]
    return None

def annexb(iid):
    t, s, e = prop(iid, "hvcC"); q = s + 22; na = data[q]; q += 1; out = b""
    for _ in range(na):
        q += 1; nn = struct.unpack(">H", data[q:q+2])[0]; q += 2
        for _ in range(nn):
            l = struct.unpack(">H", data[q:q+2])[0]; q += 2; out += b"\0\0\0\1" + data[q:q+l]; q += l
    raw = item_data(iid); k = 0
    while k < len(raw):
        l = struct.unpack(">I", raw[k:k+4])[0]; out += b"\0\0\0\1" + raw[k+4:k+4+l]; k += 4 + l
    return out

def decode(iid):
    with tempfile.TemporaryDirectory() as td:
        open(td + "/t.hevc", "wb").write(annexb(iid))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "hevc", "-i", td + "/t.hevc", "-frames:v", "1", td + "/t.png"], check=True)
        return Image.open(td + "/t.png").convert("RGB")

if items[primary] == "grid":
    g = item_data(primary); fl = g[1]; rows, cols = g[2] + 1, g[3] + 1
    W, H = (struct.unpack(">HH", g[4:8]) if not fl & 1 else struct.unpack(">II", g[4:12]))
    tiles = [decode(t) for t in dimg[primary]]; tw, th = tiles[0].size
    img = Image.new("RGB", (cols * tw, rows * th))
    for k, tl in enumerate(tiles): img.paste(tl, ((k % cols) * tw, (k // cols) * th))
    img = img.crop((0, 0, W, H))
else:
    img = decode(primary)
r = prop(primary, "irot")
if r: img = img.rotate(90 * (data[r[1]] & 3), expand=True)
m = prop(primary, "imir")
if m: img = img.transpose(Image.FLIP_LEFT_RIGHT if data[m[1]] & 1 == 0 else Image.FLIP_TOP_BOTTOM)
img.save(sys.argv[2], quality=92)
print(items[primary], img.size)
