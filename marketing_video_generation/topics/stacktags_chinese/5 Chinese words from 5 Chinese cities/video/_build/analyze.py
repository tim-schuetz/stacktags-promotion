# Decode mp3 -> mono 44.1k float, report RMS envelope around cut regions so we can
# pick exact silence-midpoint splice points.
import subprocess, numpy as np, sys

SR = 44100
def load(path):
    p = subprocess.run(['ffmpeg','-v','error','-i',path,'-ac','1','-ar',str(SR),
                        '-f','f32le','-'], capture_output=True)
    return np.frombuffer(p.stdout, dtype='<f4')

def env(x, win=0.010):
    n=int(SR*win);
    if n<1: n=1
    # frame RMS every `win`
    frames=[]
    for i in range(0,len(x)-n,n):
        frames.append((i/SR, float(np.sqrt(np.mean(x[i:i+n]**2)))))
    return frames

orig = load(sys.argv[1] if len(sys.argv)>1 else '../../script_audio.mp3')
clip = load('again_clip.mp3')
print(f"orig len {len(orig)/SR:.3f}s  clip len {len(clip)/SR:.3f}s")

def show(name, x, t0, t1):
    print(f"--- {name}  [{t0:.2f},{t1:.2f}] RMS env (10ms) ---")
    for t,r in env(x):
        if t0<=t<=t1:
            bar='#'*int(r*400)
            print(f"  {t:7.3f}  {r:.4f} {bar}")

# original: pause before 'Learn'(17.06) and pause after 'go'(21.42)->'We'(21.88)
show('ORIG pre-Learn', orig, 16.30, 17.20)
show('ORIG post-go',   orig, 21.30, 22.00)
# clip: leading + trailing + the again region
show('CLIP lead', clip, 0.00, 0.30)
show('CLIP go/again/tail', clip, 4.30, 4.83)
# overall RMS for level match
def rms_region(x,a,b):
    return float(np.sqrt(np.mean(x[int(a*SR):int(b*SR)]**2)))
print("ORIG rms[10..16] =", round(rms_region(orig,10,16),4))
print("CLIP rms[0.2..3.2] =", round(rms_region(clip,0.2,3.2),4))
