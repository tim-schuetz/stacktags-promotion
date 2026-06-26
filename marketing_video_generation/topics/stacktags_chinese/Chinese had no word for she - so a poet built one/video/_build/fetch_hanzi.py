# Fetch per-stroke vector data (hanzi-writer-data@2.0.1) for every animated character
# and vendor it locally as assets/hanzi/hanzi.js -> window.HANZI = {char:{strokes,medians}}.
import json, os, urllib.request, urllib.parse

CHARS = ["他", "她", "女", "它", "也", "人"]
BASE = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/"

out = {}
for ch in CHARS:
    url = BASE + urllib.parse.quote(ch) + ".json"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        d = json.loads(r.read().decode("utf-8"))
    out[ch] = {"strokes": d["strokes"], "medians": d["medians"]}
    print("ok", ch.encode("unicode_escape").decode("ascii"), len(d["strokes"]), "strokes")

dst = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "hanzi", "hanzi.js"))
os.makedirs(os.path.dirname(dst), exist_ok=True)
with open(dst, "w", encoding="utf-8") as f:
    f.write("window.HANZI = " + json.dumps(out, ensure_ascii=False) + ";\n")
print("SAVED", dst, os.path.getsize(dst), "bytes")
