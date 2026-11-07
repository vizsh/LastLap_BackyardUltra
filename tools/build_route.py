"""Bake the illustrative route into a texture the film can reveal with no per-frame drawing.

Output route.png: R = lamp light, G and B = position along the route (16 bit).
Also writes plate-route.webp, a flat version for visitors without the film, and lamps.webp,
the same lamps at twice the resolution and half the size. A phone sits so close to the road
that route.png would be magnified into blurs, and it needs them to stay points of light.

The route points are in the 1600 x 914 space of the aerial photograph. They must match
src/scripts/film/route.js so the lead runner lines up with the reveal.
"""
import math
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = sys.argv[1]
M = os.path.join(ROOT, "public/media")
W, H, N = 1600, 914, 1400

ROUTE = [[432, 852], [468, 762], [506, 660], [546, 565], [577, 480], [604, 408], [640, 335], [700, 330], [800, 316], [885, 302], [908, 322], [936, 346], [966, 374], [1012, 430], [1066, 520], [1126, 566], [1102, 584], [1062, 590], [1048, 640], [1058, 720], [1088, 782], [960, 790], [830, 796], [640, 798], [545, 806], [478, 838], [432, 852]]
HIDDEN = [[[708, 250], [783, 250], [783, 412], [1042, 408], [1032, 765], [722, 765], [714, 412], [708, 410]], [[972, 372], [1132, 372], [1132, 556], [1046, 572], [1042, 400]]]


def inside(x, y, poly):
    c = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            c = not c
        j = i
    return c


def sample(p, n):
    dense = []
    for i in range(len(p) - 1):
        a, b, c, e = p[max(i - 1, 0)], p[i], p[i + 1], p[min(i + 2, len(p) - 1)]
        c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6]
        c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6]
        for k in range(40):
            t = k / 40
            q = 1 - t
            dense.append([q**3 * b[d] + 3 * q * q * t * c1[d] + 3 * q * t * t * c2[d] + t**3 * c[d] for d in (0, 1)])
    dense.append(p[-1])
    dist = [0.0]
    for i in range(1, len(dense)):
        dist.append(dist[-1] + math.dist(dense[i], dense[i - 1]))
    out, j = [], 0
    for k in range(n):
        s = dist[-1] * k / (n - 1)
        while j < len(dense) - 2 and dist[j + 1] < s:
            j += 1
        out.append(dense[j])
    return np.array(out)


pts = sample(ROUTE, N)
from PIL import ImageDraw  # noqa: E402


def lamps(s, trail_level):
    """Draw the lamp map at s times the photograph's route space."""
    w_, h_ = W * s, H * s
    rng = np.random.default_rng(7)
    out = np.zeros((h_, w_), np.float32)
    yy, xx = np.mgrid[0:h_, 0:w_]

    # thin continuous trail, thinner with distance
    trail = Image.new("F", (w_, h_), 0)
    d = ImageDraw.Draw(trail)
    for i in range(1, N):
        a, b = pts[i - 1], pts[i]
        d.line([tuple(a * s), tuple(b * s)], fill=1.0, width=1 if b[1] < 560 else 2)
    out += ndi.gaussian_filter(np.asarray(trail), 0.7) * trail_level

    # hundreds of tiny lamps along the road, like runners in a long exposure
    for i in range(0, N):
        if rng.random() > 0.55:
            continue
        x, y = pts[i]
        depth = y / H
        nrm = pts[min(i + 1, N - 1)] - pts[max(i - 1, 0)]
        nrm = np.array([-nrm[1], nrm[0]]) / (np.hypot(*nrm) + 1e-6)
        x, y = (np.array([x, y]) + nrm * rng.normal(0, 0.8 + depth * 3.2)) * s
        r = (0.75 + depth * 1.9) * rng.uniform(0.7, 1.25)
        k = int(r * 4) + 2
        x0, y0 = int(x) - k, int(y) - k
        gx, gy = xx[y0:y0 + 2 * k, x0:x0 + 2 * k], yy[y0:y0 + 2 * k, x0:x0 + 2 * k]
        out[y0:y0 + 2 * k, x0:x0 + 2 * k] += np.exp(-((gx - x) ** 2 + (gy - y) ** 2) / (2 * r * r)) * rng.uniform(0.45, 1.0)

    # hide what passes behind the towers
    hide = np.zeros((h_, w_), bool)
    for poly in HIDDEN:
        im = Image.new("L", (w_, h_), 0)
        ImageDraw.Draw(im).polygon([(p[0] * s, p[1] * s) for p in poly], fill=255)
        hide |= np.asarray(im) > 0
    soft = ndi.gaussian_filter(hide.astype(np.float32), 1.2 * s)
    return np.clip(out, 0, 1) * (1 - soft)


light = lamps(1, 0.55)
Image.fromarray((lamps(2, 0.3) * 255).astype(np.uint8)).save(f"{M}/lamps.webp", quality=82, method=6)

# position along the route for every pixel near it
seed = np.ones((H, W), bool)
ix = np.clip(pts[:, 0].astype(int), 0, W - 1)
iy = np.clip(pts[:, 1].astype(int), 0, H - 1)
seed[iy, ix] = False
_, (ny, nx) = ndi.distance_transform_edt(seed, return_indices=True)
umap = np.zeros((H, W), np.float32)
umap[iy, ix] = np.arange(N) / (N - 1)
u = umap[ny, nx]
u = ndi.gaussian_filter(u, 1.0)
u16 = (np.clip(u, 0, 1) * 65535).astype(np.uint16)
rgb = np.dstack([(light * 255).astype(np.uint8), (u16 >> 8).astype(np.uint8), (u16 & 255).astype(np.uint8)])
Image.fromarray(rgb).save(f"{M}/route.png", optimize=True)

# flat version for visitors without the film
plate = Image.open(f"{M}/plate.webp").convert("RGB")
p = np.asarray(plate).astype(np.float32) / 255
big = np.asarray(Image.fromarray((light * 255).astype(np.uint8)).resize(plate.size, Image.BICUBIC)).astype(np.float32) / 255
glow = ndi.gaussian_filter(big, 7)
p = np.clip(p + big[..., None] * np.array([1, 0.3, 0.2]) + glow[..., None] * np.array([0.9, 0.12, 0.08]), 0, 1)
Image.fromarray((p * 255).astype(np.uint8)).resize((1920, round(1920 * plate.height / plate.width)), Image.LANCZOS).save(f"{M}/plate-route.webp", quality=78, method=6)

for f in ("route.png", "plate-route.webp", "lamps.webp"):
    print(f, os.path.getsize(f"{M}/{f}") // 1024, "KB")
