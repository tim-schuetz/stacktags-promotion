# Word-level alignment with faster-whisper (local; no API quota needed).
# Writes whisper.json = { duration, words:[{word,start,end}], text }.
import json, os, sys
from faster_whisper import WhisperModel

MP3 = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "script_voice.mp3"))
OUT = os.path.join(os.path.dirname(__file__), "whisper.json")
size = sys.argv[1] if len(sys.argv) > 1 else "small.en"

model = WhisperModel(size, device="cpu", compute_type="int8")
segments, info = model.transcribe(MP3, word_timestamps=True, beam_size=5)

words, text = [], []
for seg in segments:
    for w in (seg.words or []):
        words.append({"word": w.word, "start": round(w.start, 3), "end": round(w.end, 3)})
        text.append(w.word)

out = {"duration": round(info.duration, 3), "words": words, "text": "".join(text).strip()}
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print("words:", len(words), "duration:", out["duration"])
print(out["text"][:400])
