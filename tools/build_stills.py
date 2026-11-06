"""Crop and grade the licensed stills into the site's look, with a phone crop of each.

Usage: python tools/build_stills.py <source-folder> <project-root>

The grade keeps photographs natural: deep blacks, gentle contrast, and a slight
pull toward the night palette. It never turns a photograph into a colour filter.
"""
import os
import sys

import numpy as np
from PIL import Image

SRC, ROOT = sys.argv[1], sys.argv[2]
OUT = os.path.join(ROOT, "public/media")
os.makedirs(OUT, exist_ok=True)

# name: source id, desktop crop (x0, y0, x1, y1 as fractions), phone focus x, phone y span, grade
STILLS = {
    "open": ("34720620", (0, 0, 1, 1), 0.5, (0, 1), dict(sat=1.0, black=0.012, gamma=1.08)),
    "plate": ("37352236", (0, 0, 1, 1), 0.5, (0, 1), dict(sat=0.62, black=0.012, gamma=1.16, warm=0.02)),
    "again": ("13079390", (0, 0.135, 1, 0.655), 0.52, (0, 1), dict(sat=1.0, black=0.015, gamma=1.1)),
    "field": ("38674751", (0, 0.08, 1, 0.93), 0.555, (0, 1), dict(sat=0.86, black=0.012, gamma=1.08)),
    "train": ("30439443", (0, 0.1, 1, 0.92), 0.56, (0, 1), dict(sat=1.0, black=0.01, gamma=1.06)),
    "lone": ("14532913", (0, 0.3, 1, 0.72), 0.42, (0.06, 1), dict(sat=0.95, black=0.012, gamma=1.1)),
    "last": ("38500580", (0, 0.26, 1, 0.74), 0.585, (0, 1), dict(sat=0.86, black=0.012, gamma=1.12)),
    "flares": ("36668157", (0, 0, 1, 0.84), 0.5, (0, 0.86), dict(sat=0.94, black=0.012, gamma=1.14)),
}


def grade(a, sat=1.0, black=0.0, gamma=1.0, warm=0.0):
    luma = (a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32))[..., None]
    a = luma + (a - luma) * sat
    a = np.clip((a - black) / (1 - black), 0, 1) ** gamma
    # soft shoulder keeps highlights from clipping harshly
    a = np.where(a > 0.82, 0.82 + (a - 0.82) * 0.82, a)
    if warm:
        a = a * np.array([1 + warm, 1, 1 - warm], dtype=np.float32)
    return np.clip(a, 0, 1)


def save(a, path, width, quality):
    im = Image.fromarray((a * 255 + 0.5).astype("uint8"))
    if im.width != width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(path, quality=quality, method=6)
    return im.size, os.path.getsize(path) // 1024


ONLY = sys.argv[3:]
for name, (sid, box, fx, ys, g) in STILLS.items():
    if ONLY and name not in ONLY:
        continue
    src = Image.open(os.path.join(SRC, f"{sid}.jpg")).convert("RGB")
    W, H = src.size
    a = np.asarray(src).astype(np.float32) / 255
    a = grade(a, **g)

    x0, y0, x1, y1 = [int(v) for v in (box[0] * W, box[1] * H, box[2] * W, box[3] * H)]
    size, kb = save(a[y0:y1, x0:x1], f"{OUT}/{name}.webp", min(2560, x1 - x0), 80)

    # phone: tall crop around the subject
    py0, py1 = int(ys[0] * H), int(ys[1] * H)
    ph = py1 - py0
    pw = min(W, round(ph * 9 / 16))
    px = int(min(max(fx * W - pw / 2, 0), W - pw))
    msize, mkb = save(a[py0:py1, px:px + pw], f"{OUT}/{name}-m.webp", min(1080, pw), 74)
    print(f"{name:7} {size} {kb}KB | phone {msize} {mkb}KB")
