# Word-level alignment of the narration with local faster-whisper (no API quota).
# Usage: python align_fw.py [model]   (default small.en)
# Writes whisper.json: [{word, start, end}, ...] over ../../script_voice.mp3
import sys, json, os
from faster_whisper import WhisperModel

MODEL = sys.argv[1] if len(sys.argv) > 1 else "small.en"
HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(HERE, "..", "..", "script_voice.mp3")
OUT = os.path.join(HERE, "whisper.json")

model = WhisperModel(MODEL, device="cpu", compute_type="int8")
segments, info = model.transcribe(AUDIO, word_timestamps=True, language="en")

words = []
for seg in segments:
    if seg.words:
        for w in seg.words:
            words.append({"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=0)

print(f"wrote {len(words)} words -> {OUT}")
print("first:", words[0] if words else None)
print("last:", words[-1] if words else None)
