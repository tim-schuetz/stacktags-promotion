# Word-level alignment of the narration via local faster-whisper (no API/quota).
#   python align_fw.py [model]   (default small.en)
# Writes whisper.json: { words:[{w,start,end}], segments:[{start,end,text}] }
import json, os, sys
from faster_whisper import WhisperModel

MODEL = sys.argv[1] if len(sys.argv) > 1 else "small.en"
AUDIO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "script_voice.mp3"))
OUT = os.path.join(os.path.dirname(__file__), "whisper.json")

model = WhisperModel(MODEL, device="cpu", compute_type="int8")
segments, info = model.transcribe(AUDIO, word_timestamps=True, beam_size=5)

words, segs = [], []
for seg in segments:
    segs.append({"start": round(seg.start, 3), "end": round(seg.end, 3), "text": seg.text.strip()})
    for w in (seg.words or []):
        words.append({"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})

json.dump({"duration": round(info.duration, 3), "words": words, "segments": segs},
          open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("WROTE", OUT, "| words:", len(words), "| dur:", round(info.duration, 2))
for s in segs:
    print(f"  [{s['start']:6.2f}-{s['end']:6.2f}] {s['text']}")
