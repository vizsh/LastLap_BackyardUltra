"""Portrait crops for phones, plus the share image. Run after media.py."""
import os, sys
from PIL import Image

ROOT = sys.argv[1]
M = os.path.join(ROOT, "public/media")
FOCUS = {"open": .6, "exposure": .42, "tents": .62, "clock": .3, "last": .2, "flares": .42}
for name, fx in FOCUS.items():
    im = Image.open(f"{M}/{name}.webp").convert("RGB")
    w, h = im.size
    cw = min(w, round(h * 9 / 18))
    x = round(min(max(fx * w - cw / 2, 0), w - cw))
    out = im.crop((x, 0, x + cw, h))
    out = out.resize((900, round(900 * h / cw)), Image.LANCZOS)
    out.save(f"{M}/{name}-m.webp", quality=68, method=6)
    print(name, out.size, os.path.getsize(f"{M}/{name}-m.webp") // 1024, "KB")

og = Image.new("RGB", (1200, 630), (7, 3, 4))
logo = Image.open(os.path.join(ROOT, "public/brand/lastlap-logo-alpha.webp")).convert("RGBA").resize((560, 560), Image.LANCZOS)
og.paste(logo, (320, 35), logo)
og.save(f"{M}/og.jpg", quality=86)
