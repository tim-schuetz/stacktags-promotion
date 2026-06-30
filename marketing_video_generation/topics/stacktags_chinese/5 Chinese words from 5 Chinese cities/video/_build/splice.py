# Splice the regenerated hook sentence (again_clip.mp3, which contains "again")
# into script_audio.mp3, replacing the old "Learn ... same way. Let's go" segment.
#
# Cut points are chosen inside the SILENCE around the sentence so the seams are
# inaudible, AND so the tail keeps its exact original timing:
#   new = orig[0:S1]  +  clip[Cstart:Cend]  +  orig[S2:]
# with the anchor  S2 = S1 + (Cend - Cstart)  -> the appended tail lands at the
# SAME absolute times as before (so every existing app.js cue stays valid), and
# the new file is the same total length as the original.
import subprocess, numpy as np, os

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
ORIG = os.path.join(HERE, '..', '..', 'script_audio.mp3')
CLIP = os.path.join(HERE, 'again_clip.mp3')
BACKUP = os.path.join(HERE, '..', '..', 'script_audio.orig.mp3')
OUT = os.path.join(HERE, '..', '..', 'script_audio.mp3')   # overwrite (backed up first)

def load(path):
    p = subprocess.run(['ffmpeg','-v','error','-i',path,'-ac','1','-ar',str(SR),
                        '-f','f32le','-'], capture_output=True)
    return np.frombuffer(p.stdout, dtype='<f4').copy()

# always splice from the pristine original (idempotent: back up once, then read it)
import shutil
if not os.path.exists(BACKUP):
    shutil.copyfile(ORIG, BACKUP); print('backed up ->', os.path.basename(BACKUP))
orig = load(BACKUP)
clip = load(CLIP)

# level-match the clip to the narration body
clip *= 0.95

# splice points (seconds) — all inside silence (verified via analyze.py)
S1 = 16.86      # cut original near end of the pre-"Learn" pause
Cstart = 0.04   # clip: just before "Learn" onset (~0.095)
Cend = 4.63     # clip: in the trailing silence after "go" (ends ~4.45)
clip_len = Cend - Cstart
S2 = S1 + clip_len   # anchor: keep the tail perfectly aligned

def s(t): return int(round(t * SR))

# HARD concatenation (no length-changing crossfade) so the tail keeps its EXACT
# original timing. Seams sit in silence; a tiny in-place fade on each boundary
# guarantees a zero-crossing junction with no click (does not change length).
FN = int(0.006 * SR)   # 6 ms boundary fade

def edge_out(x):
    x = x.copy()
    if len(x) >= FN: x[-FN:] *= np.linspace(1, 0, FN, dtype='float32')
    return x
def edge_in(x):
    x = x.copy()
    if len(x) >= FN: x[:FN] *= np.linspace(0, 1, FN, dtype='float32')
    return x

partA = edge_out(orig[: s(S1)])
partB = edge_in(edge_out(clip[s(Cstart): s(Cend)]))
partC = edge_in(orig[s(S2):])

new = np.concatenate([partA, partB, partC])

print(f"orig {len(orig)/SR:.3f}s  new {len(new)/SR:.3f}s  (S1={S1} S2={S2:.3f} clip_len={clip_len:.3f})")
print(f"tail starts in new at {(len(partA)+len(partB))/SR:.3f}s (orig S2={S2:.3f}) -> tail shift {1000*((len(partA)+len(partB))/SR - S2):+.1f}ms")

# write WAV then encode to mp3 (44.1k, 192k) to match the pipeline
import wave
tmpwav = os.path.join(HERE, '_spliced.wav')
pcm = np.clip(new, -1, 1)
pcm16 = (pcm * 32767.0).astype('<i2')
with wave.open(tmpwav, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm16.tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-i',tmpwav,'-ac','1','-ar',str(SR),
                '-codec:a','libmp3lame','-b:a','192k', OUT], check=True)
os.remove(tmpwav)
print('WROTE', OUT)
