"""Turn the raw recordings into the film's sound stems.

Usage: python tools/build_audio.py <folder-of-wavs> <project-root>

Loops are made circular, then padded on both sides with their own continuation.
The player loops inside the padding, so encoder delay can never cause a click.
"""
import json
import os
import subprocess
import sys

import numpy as np

SRC, ROOT = sys.argv[1], sys.argv[2]
OUT = os.path.join(ROOT, "public/audio")
os.makedirs(OUT, exist_ok=True)
SR, PAD = 44100, 0.25


def read(name, mono=False):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{SRC}/{name}.wav", "-ac", "1" if mono else "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    a = np.frombuffer(raw, np.float32).copy()
    return a if mono else a.reshape(-1, 2)


def rms_db(a):
    return 20 * np.log10(np.sqrt(np.mean(a**2)) + 1e-9)


def level(a, db):
    a = a * 10 ** ((db - rms_db(a)) / 20)
    peak = np.abs(a).max()
    return a * (0.89 / peak) if peak > 0.89 else a


def circular(a, seconds, start=0.0, fade=1.5):
    """Take `seconds` of audio that loops without a seam, by equal-power crossfading the tail into the head."""
    s, n, f = int(start * SR), int(seconds * SR), int(fade * SR)
    seg = a[s:s + n + f].copy()
    t = np.linspace(0, np.pi / 2, f)[:, None] if a.ndim == 2 else np.linspace(0, np.pi / 2, f)
    head, tail = seg[:f], seg[n:n + f]
    seg[:f] = head * np.sin(t) + tail * np.cos(t)
    return seg[:n]


def write(name, a, bitrate):
    tmp = f"{OUT}/_{name}.f32"
    a.astype(np.float32).tofile(tmp)
    ch = "2" if a.ndim == 2 else "1"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", ch, "-i", tmp, "-c:a", "aac", "-b:a", bitrate, "-movflags", "+faststart", f"{OUT}/{name}.m4a"], check=True)
    os.remove(tmp)
    return os.path.getsize(f"{OUT}/{name}.m4a") // 1024


manifest = {}


def loop(name, wav, seconds, db, start=0.0, fade=1.5, bitrate="112k", mono=False):
    a = level(circular(read(wav, mono), seconds, start, fade), db)
    p = int(PAD * SR)
    padded = np.concatenate([a[-p:], a, a[:p]])
    kb = write(name, padded, bitrate)
    manifest[name] = {"loop": [PAD, round(PAD + seconds, 4)]}
    print(f"{name:7} {seconds:5.1f}s {kb}KB")


def shot(name, a, db=None, peak=None, bitrate="128k"):
    if db is not None:
        a = level(a, db)
    if peak is not None:
        a = a * (peak / (np.abs(a).max() + 1e-9))
    kb = write(name, a, bitrate)
    manifest[name] = {}
    print(f"{name:7} {len(a) / SR:5.1f}s {kb}KB")


# beds
loop("bed", "2678", 34, -25, start=8, fade=2.5)         # city at night
loop("low", "1177", 24, -21, start=6, fade=3)           # deep wind hum, the score of the film
loop("rain", "1247", 22, -26, start=30, fade=2)
loop("crowd", "462", 7.5, -24, start=0.3, fade=1.5)
loop("breath", "2232", 4.4, -27, fade=0.4, bitrate="80k")
loop("train", "train", 12, -25, start=2, fade=1.5)
loop("birds", "birds", 18, -30, start=4, fade=2)

# heartbeat: find the real pulse, so the loop lands on a beat
h = read("494", True)
env = np.abs(h[:SR * 30])
env = np.convolve(env, np.ones(2000) / 2000, "same")[::200]
ac = np.correlate(env - env.mean(), env - env.mean(), "full")[len(env):]
lo, hi = int(0.55 * SR / 200), int(1.6 * SR / 200)
period = (lo + ac[lo:hi].argmax()) * 200 / SR
print("heart period %.3fs" % period)
loop("heart", "494", round(period * 6, 3), -19, start=4, fade=0.12, bitrate="96k", mono=True)

# one-shots
shot("bell", read("619"), peak=0.8)
shot("whoosh", read("1471"), peak=0.6)

# footfalls: cut clean single steps from a real recording, so scroll speed can set the cadence
w = read("1274", True)
win = 1024
e = np.sqrt(np.convolve(w**2, np.ones(win) / win, "same"))
flux = np.maximum(np.diff(e[::256]), 0)
idx = []
order = np.argsort(flux)[::-1]
for i in order:
    p = i * 256
    if all(abs(p - q) > int(0.22 * SR) for q in idx):
        idx.append(p)
    if len(idx) >= 30:
        break
idx = sorted(idx)
L, hits = int(0.2 * SR), []
for p in idx:
    seg = w[max(p - 200, 0):max(p - 200, 0) + L]
    if len(seg) < L:
        continue
    q = seg * np.linspace(1, 0, L) ** 1.6
    # prefer strong attacks with a quick decay
    score = np.abs(q[:2000]).max() / (np.abs(q[-3000:]).mean() + 1e-4)
    hits.append((score, q))
hits = [q for _, q in sorted(hits, key=lambda t: -t[0])[:6]]
gap = int(0.3 * SR)
bank = np.zeros(gap * len(hits), np.float32)
for i, q in enumerate(hits):
    q = q * (0.8 / (np.abs(q).max() + 1e-9))
    bank[i * gap:i * gap + L] = q
shot("steps", bank, bitrate="96k")
manifest["steps"] = {"gap": 0.3, "count": len(hits), "length": 0.2}

json.dump(manifest, open(f"{OUT}/stems.json", "w"), indent=1)
print(json.dumps(manifest))
