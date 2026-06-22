# Local forced-ish alignment of ../../script_audio.mp3 with word timestamps via
# faster-whisper (CTranslate2, CPU). Writes whisper.json (same shape the old
# OpenAI whisper_align.js produced: {duration, segments:[{start,end,text,words}]}).
import os, sys, json
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(HERE, '..', '..', 'script_audio.mp3')
OUT = os.path.join(HERE, 'whisper.json')
MODEL = sys.argv[1] if len(sys.argv) > 1 else 'base.en'

print('loading model', MODEL, '...')
model = WhisperModel(MODEL, device='cpu', compute_type='int8')
print('transcribing', os.path.basename(AUDIO), '...')
segments, info = model.transcribe(AUDIO, language='en', word_timestamps=True,
                                  beam_size=5, vad_filter=False)

out = {'duration': float(info.duration), 'segments': []}
for seg in segments:
    out['segments'].append({
        'start': float(seg.start), 'end': float(seg.end), 'text': seg.text,
        'words': [{'word': w.word, 'start': float(w.start), 'end': float(w.end)}
                  for w in (seg.words or [])],
    })
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

print(f"duration {out['duration']:.2f}s, {len(out['segments'])} segments -> whisper.json")
for s in out['segments']:
    print(f"  {s['start']:6.2f}-{s['end']:6.2f}  {s['text'].strip()}")
