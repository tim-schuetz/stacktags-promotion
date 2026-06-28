# Word-level alignment of the narration with local faster-whisper (no API quota).
# -> whisper.json : { words:[{word,start,end}], segments:[{start,end,text}] }
import json, os, sys
from faster_whisper import WhisperModel

HERE = os.path.dirname(__file__)
AUDIO = os.path.join(HERE, '..', '..', 'script_voice.mp3')
OUT = os.path.join(HERE, 'whisper.json')
SIZE = sys.argv[1] if len(sys.argv) > 1 else 'small.en'

print('loading', SIZE, '...')
model = WhisperModel(SIZE, device='cpu', compute_type='int8')
segments, info = model.transcribe(AUDIO, word_timestamps=True, vad_filter=False)

words, segs = [], []
for seg in segments:
    segs.append({'start': round(seg.start, 3), 'end': round(seg.end, 3), 'text': seg.text})
    for w in (seg.words or []):
        words.append({'word': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3)})

json.dump({'words': words, 'segments': segs}, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'wrote {OUT}: {len(words)} words, {len(segs)} segments, audio {info.duration:.2f}s')
