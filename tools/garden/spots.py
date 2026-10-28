"""Готовит нарисованные ростки для «Нашего сада»:
1) спрайты art/items/{kind}-{v}.webp (тон подогнан под картинку сада);
2) js/garden-spots.js — для каждого уровня 2..11 места каждого вида ростка (не на тропе и не на предметах),
   размеры спрайтов и камни на тропинке. Размеры считаются той же формулой, что в garden.js."""
import json, random, numpy as np
from PIL import Image, ImageEnhance
from scipy import ndimage
S = "/tmp/garden-work/"
REPO = "./"
M = np.load(S + "masks/masks.npz")
path, path_wide = M["path"], M["path_wide"]
H, W = path.shape
HOR = 388
KINDS = ["tree", "bush", "flower", "grass", "lamp", "stone", "fly"]
# высота спрайта у нижнего края картинки (у камня — ширина); вглубь уменьшается
SIZE = {"tree": 215, "bush": 98, "flower": 72, "grass": 78, "lamp": 120, "stone": 70, "fly": 30}
CAP = {"tree": 5, "bush": 7, "flower": 10, "grass": 16, "lamp": 6, "stone": 7}
TONE = {"tree": (.93, .86), "bush": (.93, .86), "flower": (.95, .92), "grass": (.9, .82), "stone": (.97, 1.0), "lamp": (1, 1), "fly": (1, 1)}
MAXS = {"tree": 240, "bush": 220, "flower": 200, "grass": 180, "lamp": 180, "stone": 200, "fly": 120}
def f(y): return 0.3 + 0.7 * (y - HOR) / (H - HOR)

# --- спрайты
import os; os.makedirs(REPO + "art/items", exist_ok=True)
DIM = {}
for k in KINDS:
    DIM[k] = []
    for v in range(1, 5):
        im = Image.open(S + f"items2/{k}-{v}.webp").convert("RGBA")
        r, g, b, a = im.split(); rgb = Image.merge("RGB", (r, g, b))
        br, sat = TONE[k]; rgb = ImageEnhance.Color(ImageEnhance.Brightness(rgb).enhance(br)).enhance(sat)
        if k == "stone":  # камень — в цвет тропинки, чтобы не выглядел наклейкой
            rgb = Image.blend(rgb, Image.new("RGB", rgb.size, (238, 172, 116)), .42)
        im = Image.merge("RGBA", (*rgb.split(), a))
        s = min(1, MAXS[k] / max(im.size)); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        im.save(REPO + f"art/items/{k}-{v}.webp", "WEBP", quality=82, method=6)
        DIM[k].append([im.width, im.height])

def box(k, v, x, y):
    w0, h0 = DIM[k][v]
    if k == "stone": w = SIZE[k] * f(y); h = w * h0 / w0
    else: h = SIZE[k] * f(y); w = h * w0 / h0
    return x - w / 2, y - h, x + w / 2, y

def hit(mask, b, pad=0):
    x0, y0, x1, y1 = [int(round(t)) for t in b]
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad); x1, y1 = min(W, x1 + pad), min(H, y1 + pad)
    if x1 <= x0 or y1 <= y0: return 1.0
    return mask[y0:y1, x0:x1].mean()

def overlap(a, b):
    ix = max(0, min(a[2], b[2]) - max(a[0], b[0])); iy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    sa = (a[2] - a[0]) * (a[3] - a[1]); sb = (b[2] - b[0]) * (b[3] - b[1])
    return ix * iy / max(1, min(sa, sb))

# центр тропинки по строкам
cx = np.full(H, np.nan); half = np.zeros(H)
for y in range(HOR, H):
    xs = np.where(path[y])[0]
    if len(xs): cx[y] = xs.mean(); half[y] = (xs.max() - xs.min()) / 2

ZONE = {"tree": (408, 600), "bush": (420, 790), "flower": (470, 795), "grass": (500, 798), "lamp": (440, 790)}
OUT = {}
for n in range(2, 12):
    rnd = random.Random(1000 + n)
    # предмет закрывает росток, только если стоит ближе к зрителю: для каждого предмета запоминаем его нижний край
    ob = ndimage.binary_dilation(M["o%d" % n], iterations=5)
    lab, k = ndimage.label(ob); bottoms = ndimage.maximum(np.arange(H)[:, None] * np.ones((1, W)), lab, range(1, k + 1))
    D = np.zeros((H, W)); D[lab > 0] = np.asarray(bottoms)[lab[lab > 0] - 1]
    placed = []; res = {k: [] for k in CAP}
    order = []
    for i in range(max(CAP.values())):
        for k in ["grass", "flower", "bush", "tree", "lamp"]:
            if i < CAP[k]: order.append((k, i))
    for k, i in order:
        v = i % 4; best = None; bestd = -1
        y0, y1 = ZONE[k]
        for t in range(260):
            y = rnd.uniform(y0, y1); x = rnd.uniform(20, W - 20)
            if k == "lamp":  # фонарики — у края тропинки
                if np.isnan(cx[int(y)]): continue
                side = 1 if (i % 2) else -1
                x = cx[int(y)] + side * (half[int(y)] + 10 + 24 * f(y)) + rnd.uniform(-6, 6)
            b = box(k, v, x, y)
            if b[0] < 4 or b[2] > W - 4 or b[1] < 120: continue
            if hit(path_wide, b) > (0.0 if k != "grass" else 0.02): continue
            if hit((D > 0) if k in ("tree", "bush") else (D > y - 6), b) > 0: continue  # большие ростки не загораживают предметы сада
            if path_wide[int(y) - 1, int(x)]: continue
            if k == "lamp" and any(np.hypot(x - q[0], (y - q[1]) * 1.5) < 150 for q in res["lamp"]): continue
            if any(overlap(b, q) > (0.18 if k in ("grass", "flower") else 0.1) for q in placed): continue
            # самое далёкое от уже посаженных место (равномерно по саду), с лёгкой тягой вперёд, где ростки крупнее
            d = min([np.hypot(x - (q[0] + q[2]) / 2, (y - q[3]) * 1.6) for q in placed] or [999]) + (y - HOR) * (0.25 if k in ("grass", "flower") else 0.08)
            if d > bestd: bestd, best = d, (x, y, b)
            if t > 60 and best: break
        if best:
            placed.append(best[2]); res[k].append([round(best[0]), round(best[1])])
    # камни-ступени на тропинке: снизу вглубь, чуть вправо-влево
    st = []; y = 784.0; j = 0
    while len(st) < CAP["stone"] and y > 470:
        yi = int(y)
        if not np.isnan(cx[yi]):
            x = cx[yi] + (0.22 if j % 2 else -0.22) * half[yi]
            b = box("stone", j % 4, x, y)
            if hit(ndimage.binary_dilation(M["o%d" % n], iterations=3), b) == 0 and hit(path, b) > .9:
                st.append([round(x), round(y)]); j += 1
        y -= 62 * f(y) + 8
    res["stone"] = st
    OUT[n] = res
    print(n, {k: len(v) for k, v in res.items()})

js = ("/* Места для нарисованных ростков «Нашего сада» (картинка 1200×800). Сгенерировано скриптом — руками не править.\n"
      "   GSPR — ширина/высота спрайтов art/items/{вид}-{1..4}.webp; GSPOTS[уровень][вид] — точки [x, y] (низ ростка). */\n"
      "window.GSPR=" + json.dumps(DIM, separators=(",", ":")) + ";\n"
      "window.GSIZE=" + json.dumps(SIZE, separators=(",", ":")) + ";\n"
      "window.GSPOTS=" + json.dumps(OUT, separators=(",", ":")) + ";\n")
open(REPO + "js/garden-spots.js", "w").write(js)
print(len(js), "bytes")
