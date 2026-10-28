"""Маски для каждого уровня сада (1200×800): тропинка, предметы, лужайка. Сохраняет npz и картинки для проверки."""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
ART = "./art/"
OUT = "/tmp/garden-work/masks/"
import os; os.makedirs(OUT, exist_ok=True)
HOR = 388  # ниже — земля

def load(i): return np.asarray(Image.open(ART + "garden-%02d.webp" % i).convert("RGB")).astype(float)
def blur(a, r): return np.asarray(Image.fromarray(np.clip(a, 0, 255).astype("uint8")).filter(ImageFilter.GaussianBlur(r))).astype(float)
def hsv(a):
    im = Image.fromarray(a.astype("uint8")).convert("HSV"); h = np.asarray(im).astype(float)
    return h[..., 0] / 255 * 360, h[..., 1] / 255, h[..., 2] / 255

H, W = 800, 1200
yy = np.arange(H)[:, None] * np.ones((1, W))
ground = yy > HOR

# тропинка — по 3-му уровню (светлая на зелёной лужайке)
i3 = load(3); h, s, v = hsv(blur(i3, 2))
path = (v > .82) & (h > 15) & (h < 42) & ground
path = ndimage.binary_opening(path, iterations=2); path = ndimage.binary_closing(path, iterations=6)
lab, k = ndimage.label(path); sz = ndimage.sum(path, lab, range(1, k + 1)); path = lab == (1 + int(np.argmax(sz)))
path = ndimage.binary_fill_holes(path)
# камешки по краю тропинки не считаем — чуть расширяем
path_wide = ndimage.binary_dilation(path, iterations=4)

objs = {}
b3 = blur(i3, 3)
for n in range(1, 12):
    if n <= 3:
        o = np.zeros((H, W), bool)
        if n == 3: pass
    else:
        d = np.abs(blur(load(n), 3) - b3).max(axis=2)
        high = yy > (220 if n < 10 else HOR)   # над горизонтом — качели, дерево, арка, беседка (у 10-го там радуга, берём с 9-го)
        o = (d > 26) & high
        o = ndimage.binary_opening(o, iterations=2)
        lab, k = ndimage.label(o); sz = ndimage.sum(o, lab, range(1, k + 1)); o = np.isin(lab, 1 + np.where(sz >= 250)[0])
        o = ndimage.binary_closing(o, iterations=5); o = ndimage.binary_fill_holes(o)
        o &= ~ndimage.binary_erosion(path, iterations=3) | (n >= 8)  # арка стоит над тропой (с 8 уровня)
    if n == 10: o |= objs[9]
    objs[n] = o
# табличка — с 3 уровня (её нет в разнице с 3-м)
sign = np.zeros((H, W), bool); sign[540:680, 180:305] = True
for n in range(3, 12): objs[n] |= sign
# 11 уровень: свет другой, поэтому предметы берём с 10-го + фонарики у тропы
LAMPS11 = [(690, 565), (712, 660), (598, 800), (1000, 815), (875, 600), (822, 527), (740, 493), (858, 503)]
o = objs[10].copy()
for x, y in LAMPS11:
    x, y = x * 1200 / 1536, y * 800 / 1024; o[int(y - 55):int(y + 14), int(x - 18):int(x + 18)] = True
objs[11] = o
np.savez_compressed(OUT + "masks.npz", path=path, path_wide=path_wide, **{"o%d" % n: objs[n] for n in objs})
for n in range(1, 12):
    img = load(n).copy()
    img[path] = img[path] * .4 + np.array([60, 120, 255]) * .6
    img[objs[n]] = img[objs[n]] * .4 + np.array([255, 40, 40]) * .6
    Image.fromarray(img.astype("uint8")).resize((600, 400)).save(OUT + "m%02d.png" % n)
print("ok", path.mean())
