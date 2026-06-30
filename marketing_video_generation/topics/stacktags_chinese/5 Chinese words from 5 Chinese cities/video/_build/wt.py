# Word-timestamp transcribe of an arbitrary audio file (faster-whisper).
# Usage: wt.py <audio> [model]
import sys, json
from faster_whisper import WhisperModel
AUDIO = sys.argv[1]
MODEL = sys.argv[2] if len(sys.argv) > 2 else 'small.en'
model = WhisperModel(MODEL, device='cpu', compute_type='int8')
segments, info = model.transcribe(AUDIO, language='en', word_timestamps=True,
                                  beam_size=5, vad_filter=False)
words = []
for seg in segments:
    for w in (seg.words or []):
        words.append({'word': w.word, 'start': float(w.start), 'end': float(w.end)})
print('DURATION', round(float(info.duration), 3))
for w in words:
    print(f"{w['start']:7.3f}-{w['end']:7.3f}  {w['word']!r}")
