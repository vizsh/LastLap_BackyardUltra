"""Grade all site photos into one night look. Highlights stay white, mids go red, shadows go ink."""
import os, sys
import numpy as np
from PIL import Image, ImageFilter

REF, ROOT = sys.argv[1], sys.argv[2]
OUT = os.path.join(ROOT, "public/media")
os.makedirs(OUT, exist_ok=True)


def curve(x, pts):
    a, b = zip(*pts)
    return np.interp(x, a, b)


def duo(rgb, amt):
    l = rgb @ np.array([.2126, .7152, .0722])
    r = curve(l, [(0, .012), (.2, .30), (.5, .74), (1, 1)])
    g = curve(l, [(0, .006), (.45, .07), (.75, .36), (1, .97)])
    b = curve(l, [(0, .010), (.45, .06), (.75, .31), (1, .95)])
    return rgb * (1 - amt) + np.dstack([r, g, b]) * amt


def load(p):
    return np.asarray(Image.open(p).convert("RGB")).astype(np.float32) / 255


def feather_dark(a, box, strength=.1, blur=40):
    m = Image.new("L", (a.shape[1], a.shape[0]), 0)
    m.paste(255, box)
    m = np.asarray(m.filter(ImageFilter.GaussianBlur(blur))).astype(np.float32)[..., None] / 255
    return a * (1 - m * (1 - strength))


def soften(a, box, r=14):
    im = Image.fromarray((a * 255).astype("uint8"))
    im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(r)), box)
    return np.asarray(im).astype(np.float32) / 255


def save(a, name, width=2000, q=74, grain=.018):
    h, w = a.shape[:2]
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype("uint8"))
    if w != width:
        im = im.resize((width, round(h * width / w)), Image.LANCZOS)
    n = np.asarray(im).astype(np.float32) / 255
    n = n + np.random.default_rng(3).normal(0, grain, n.shape[:2])[..., None]
    Image.fromarray((np.clip(n, 0, 1) * 255).astype("uint8")).save(f"{OUT}/{name}.webp", quality=q, method=6)
    print(name, os.path.getsize(f"{OUT}/{name}.webp") // 1024, "KB")


P = os.path.join(ROOT, "review/photos")
# opening: the rainy line-up
a = load(f"{REF}/2.webp")
a = soften(a, (500, 1000, 700, 1090), 10)
save(duo(a, .22) * .94, "open")

# aerial plate: drained of colour so the route is the only red
a = load(f"{P}/37352236.jpg")
l = (a @ np.array([.2126, .7152, .0722]))[..., None]
a = a * .34 + l * np.array([1.02, .93, .86]) * .66
a = np.clip((a - .02) * 1.05, 0, 1) ** 1.32 * .9
save(a, "plate", 2400, 72, .012)

# real long exposures of traffic circling
a = load(f"{P}/4959167.jpg")
save(duo(np.clip(a[:1560], 0, 1) ** 1.9, .72), "exposure")
a = load(f"{P}/3148002.jpg")
save(duo(a ** 1.7, .72), "exposure-2")

# dusk crew tents
a = load(f"{REF}/6.webp")
a = feather_dark(a, (715, 770, 790, 950), .3, 16)
a = feather_dark(a, (1085, 850, 1165, 950), .35, 14)
save(duo(a, .28), "tents")

# the clock
a = load(f"{REF}/1.webp")
save(duo(a, .15), "clock", 1800, 76, .022)

# last light: lone runner under the arch, side flags retouched out
a = load(f"{REF}/4.webp")
a = feather_dark(a, (1320, 560, 1560, 640), .25, 18)
a = a[120:1280, 690:1590]
save(duo(a, .3), "last", 1600, 74, .022)

# flares
a = load(f"{REF}/8.webp")[:820, :1860]
a = soften(a, (1480, 560, 1640, 690), 16)
a = soften(a, (820, 640, 960, 790), 8)
save(duo(a, .15) * .62, "flares")
