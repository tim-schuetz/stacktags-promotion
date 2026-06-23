#!/usr/bin/env python3
"""Word-level alignment of the narration via local faster-whisper (no API).
Outputs whisper.json = {words:[{w,start,end}], text} for placing CUES/SUBS/SFX."""
import json, pathlib, sys
from faster_whisper import WhisperModel

HERE = pathlib.Path(__file__).resolve().parent
MP3 = HERE.parent.parent / "script_voice.mp3"
OUT = HERE / "whisper.json"

model = WhisperModel("small.en", device="cpu", compute_type="int8")
segments, info = model.transcribe(str(MP3), word_timestamps=True, beam_size=5)

words, segs = [], []
for s in segments:
    segs.append({"start": round(s.start, 3), "end": round(s.end, 3), "text": s.text.strip()})
    for w in (s.words or []):
        words.append({"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})

OUT.write_text(json.dumps({"words": words, "segments": segs}, ensure_ascii=False, indent=0), encoding="utf-8")
print(f"{len(words)} words, {len(segs)} segments -> {OUT}")
# quick dump so I can eyeball anchor times
for w in words:
    print(f"{w['start']:6.2f} {w['w']}")
