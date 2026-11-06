"""Estimate a depth map for each still, so the film can move the camera with real parallax.

Usage: python tools/build_depth.py <path-to-depth-anything-v2-small.onnx> <project-root>
Model: onnx-community/depth-anything-v2-small (Apache-2.0)
"""
import os
import sys

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

MODEL, ROOT = sys.argv[1], sys.argv[2]
OUT = os.path.join(ROOT, "public/media")
NAMES = sys.argv[3:] or ["open", "plate", "again", "field", "train", "lone", "last", "flares"]
sess = ort.InferenceSession(MODEL, providers=["CPUExecutionProvider"])
inp = sess.get_inputs()[0].name
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def depth(im):
    w, h = im.size
    # the network wants sides that are multiples of 14
    s = 700 / max(w, h)
    nw, nh = max(14, round(w * s / 14) * 14), max(14, round(h * s / 14) * 14)
    a = np.asarray(im.resize((nw, nh), Image.BICUBIC)).astype(np.float32) / 255
    # night photographs are very dark: lift them so the network can read the structure
    a = np.clip(a, 0, 1) ** 0.6
    x = ((a - MEAN) / STD).transpose(2, 0, 1)[None]
    d = sess.run(None, {inp: x})[0].squeeze()
    lo, hi = np.percentile(d, 1), np.percentile(d, 99)
    return np.clip((d - lo) / (hi - lo + 1e-6), 0, 1)


for name in NAMES:
    for suffix in ("", "-m"):
        im = Image.open(f"{OUT}/{name}{suffix}.webp").convert("RGB")
        d = depth(im)
        g = Image.fromarray((d * 255).astype("uint8"))
        width = 640 if suffix else 960
        g = g.resize((width, round(width * im.height / im.width)), Image.BICUBIC).filter(ImageFilter.GaussianBlur(2.2))
        path = f"{OUT}/{name}{suffix}-d.webp"
        g.convert("RGB").save(path, quality=62, method=6)
        print(name + suffix, g.size, os.path.getsize(path) // 1024, "KB", "mean %.2f" % d.mean())
