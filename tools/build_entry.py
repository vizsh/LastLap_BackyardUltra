"""Cut the runner, the land and the sun out of the Last light still.

Usage: python tools/build_entry.py <project-root>

The registration page stands the visitor's name in the sky of this photograph, behind
the runner and inside the sun's glow. That needs a foreground layer with a real matte,
taken from the picture itself:

  1. compare every pixel with the brightest sky around it, which finds the silhouette
     whether the sky there is blazing or nearly dark
  2. walk up each column from the bottom until the sky begins, which finds the land
  3. keep the sun's halo too, so letters melt into the light instead of sitting on it
  4. close the gap the sun burns into the runner's shoulder, or the letters show through
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

ROOT = sys.argv[1]
M = os.path.join(ROOT, "public/media")


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def blur(a, radius):
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(radius))
    return np.asarray(im).astype(np.float32) / 255


def matte(rgb, sun):
    H, W, _ = rgb.shape
    red, green = rgb[..., 0], rgb[..., 1]

    # local sky brightness: the brightest red nearby, computed small because it is smooth
    k = 4
    small = Image.fromarray((red * 255).astype("uint8")).resize((W // k, H // k), Image.BILINEAR)
    size = max(9, int(W / k * 0.075)) | 1
    env = small.filter(ImageFilter.MaxFilter(size)).filter(ImageFilter.GaussianBlur(size / 3))
    env = np.asarray(env.resize((W, H), Image.BICUBIC)).astype(np.float32) / 255
    ratio = red / np.maximum(env, 0.05)
    subject = smooth(0.86, 0.5, ratio)

    # land: from the bottom of each column up to where the sky starts
    sky = (ratio > 0.8) & (red > 0.36)
    # real sky keeps going upward, unlike a bright patch of haze on a hill
    tall = max(3, int(H * 0.035))
    rows = np.cumsum(sky, axis=0)
    run = np.zeros_like(sky)
    run[tall:] = (rows[tall:] - rows[:-tall]) >= tall
    top = H - 1 - np.argmax(run[::-1], axis=0)
    # a wide median drops grass stalks and legs, which the subject term already covers
    n = max(5, W // 20) | 1
    padded = np.pad(top, n // 2, mode="edge")
    top = np.median(np.lib.stride_tricks.sliding_window_view(padded, n), axis=1)
    land = blur((np.arange(H)[:, None] > top[None, :]).astype(np.float32), W / 1400)

    # the sun: green only rises this high in the light itself
    glow = smooth(0.64, 1.0, blur(green, W / 140))

    a = np.maximum(np.maximum(subject, land), glow)

    # the shoulder: morphological closing, only in a small circle around the sun
    sx, sy, r = int(sun[0] * W), int(sun[1] * H), int(W * sun[2])
    box = (max(0, sx - r), max(0, sy - r), min(W, sx + r), min(H, sy + r))
    patch = Image.fromarray((a * 255).astype("uint8")).crop(box)
    k = max(3, int(W * 0.008)) | 1
    for f in (ImageFilter.MaxFilter, ImageFilter.MinFilter):
        for _ in range(3):
            patch = patch.filter(f(k))
    closed = np.asarray(patch).astype(np.float32) / 255
    yy, xx = np.mgrid[box[1]:box[3], box[0]:box[2]]
    near = smooth(1.0, 0.82, np.hypot(xx - sx, yy - sy) / r)
    a[box[1]:box[3], box[0]:box[2]] = np.maximum(a[box[1]:box[3], box[0]:box[2]], closed * near)
    return a


# where the sun sits in each crop (x, y) and how far its glare reaches, as a share of the width
for name, sun in (("last", (0.486, 0.278, 0.066)), ("last-m", (0.447, 0.436, 0.104))):
    im = Image.open(f"{M}/{name}.webp").convert("RGB")
    rgb = np.asarray(im).astype(np.float32) / 255
    a = matte(rgb, sun)
    out = Image.merge("RGBA", (*im.split(), Image.fromarray((a * 255 + 0.5).astype("uint8"))))
    path = f"{M}/{name}-fg.webp"
    out.save(path, quality=80, alpha_quality=88, method=6)
    print(name, im.size, os.path.getsize(path) // 1024, "KB")
