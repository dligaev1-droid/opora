import sys, numpy as np
from PIL import Image
src, name, out = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert("RGBA"); a = np.array(im); a[..., 3] = np.where(a[..., 3] < 10, 0, a[..., 3])
H, W = a.shape[:2]; al = a[..., 3] > 40
# граница между вариантами — самая пустая полоса около середины
cx = W // 4 + int(np.argmin(al[:, W // 4:3 * W // 4].sum(0)))
cy = H // 4 + int(np.argmin(al[H // 4:3 * H // 4, :].sum(1)))
j = 0
for (y0, y1) in [(0, cy), (cy, H)]:
    for (x0, x1) in [(0, cx), (cx, W)]:
        q = a[y0:y1, x0:x1]; ys, xs = np.where(q[..., 3] > 0); j += 1
        p = Image.fromarray(q).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)); s = min(1, 320 / max(p.size))
        p = p.resize((round(p.width * s), round(p.height * s)), Image.LANCZOS)
        p.save(f"{out}/{name}-{j}.webp", "WEBP", quality=85, method=6)
        edge = xs.min() == 0 or ys.min() == 0 or xs.max() == q.shape[1] - 1 or ys.max() == q.shape[0] - 1
        print(name, j, p.size, "касается края!" if edge else "")
