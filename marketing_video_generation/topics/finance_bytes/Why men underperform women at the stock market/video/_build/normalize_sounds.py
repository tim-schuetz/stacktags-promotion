# One-time: normalise the SFX assets to ~-3 dBFS peak (raw assets are very quiet
# ~-25 dBFS and would be inaudible under the narration). Overwrites in place.
import os, re, subprocess, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SND = os.path.join(HERE, "..", "assets", "sound")
TARGET = -3.0

JOBS = [
    ("swoosh.ogg", ["-c:a", "libvorbis", "-q:a", "5"]),
    ("pop.wav",    ["-c:a", "pcm_s16le"]),
    ("ticking.mp3",["-c:a", "libmp3lame", "-q:a", "2"]),
]

def max_volume(path):
    p = subprocess.run(["ffmpeg", "-i", path, "-af", "volumedetect", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = re.search(r"max_volume:\s*(-?[0-9.]+) dB", p.stderr)
    return float(m.group(1)) if m else None

for name, codec in JOBS:
    f = os.path.join(SND, name)
    if not os.path.exists(f):
        print("  skip (missing):", name); continue
    mx = max_volume(f)
    if mx is None:
        print("  could not measure:", name); continue
    gain = round(TARGET - mx, 2)
    ext = os.path.splitext(name)[1]
    tmp = os.path.join(SND, "_n" + ext)
    subprocess.run(["ffmpeg", "-y", "-i", f, "-af", f"volume={gain}dB", *codec, tmp],
                   check=True, capture_output=True)
    os.replace(tmp, f)
    nm = max_volume(f)
    print(f"  {name}: max {mx} dB  +{gain} dB  -> {nm} dB")

print("Done.")
