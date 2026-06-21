// Forced alignment via Gemini, CHUNKED (Gemini drifts past ~1 min, so we align
// short audio windows separately and offset). We KNOW the transcript, so we ask
// Gemini for the start time of each given phrase within its chunk.
// Writes gemini_align.json (array of {t, text}) and prints it.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const AUDIO = path.resolve(__dirname, '../../script_audio.mp3');

const PHRASES = [
  'Over a billion people speak Mandarin,',                                   // 0
  'but almost none of them call it that.',                                   // 1
  'Mandarin is a name foreigners gave it.',                                  // 2
  'And the real story of how it took over China',                           // 3
  'begins before Rome was ever an empire.',                                  // 4
  'Because long before Rome ruled anything,',                                // 5
  'China had already risen and fallen through dynasties',                    // 6
  'going back more than three thousand years.',                              // 7
  "But China back then wasn't one country.",                                 // 8
  'It was a patchwork of rival states,',                                     // 9
  'locked in near-constant war,',                                            // 10
  'dozens of kingdoms, with different rulers,',                              // 11
  'different armies, and different spoken tongues.',                         // 12
  'Then, in 221 BC, one state finally conquered the rest,',                  // 13
  'forced them into a single empire,',                                       // 14
  'and standardized the writing,',                                           // 15
  'so everyone wrote the same characters.',                                  // 16
  "That first empire didn't last long.",                                     // 17
  'But the dynasty after it did: the Han.',                                  // 18
  'The Han ruled for four centuries,',                                       // 19
  'and became so foundational that, to this day,',                           // 20
  'most Chinese call themselves Han,',                                       // 21
  'and their language Hanyu, the language of Han.',                          // 22
  "But here's the catch:",                                                   // 23
  'unifying the writing is not the same as unifying the speech.',            // 24
  'For two thousand years, Chinese across the empire wrote alike',           // 25
  "but spoke languages they couldn't understand out loud.",                  // 26
  'So to actually govern, the officials settled',                            // 27
  'on one shared spoken standard,',                                          // 28
  'based on the northern, capital dialect.',                                 // 29
  'They called it guanhua',                                                  // 30
  'the speech of the officials.',                                            // 31
  "And that's where our word is born.",                                      // 32
  'When Portuguese traders reached China in the 1500s,',                     // 33
  'they called those robed officials mandarins',                            // 34
  "so in Europe, the officials' language became Mandarin.",                  // 35
  'A foreign name for the language of power.',                               // 36
  'Then, last century, that same northern standard was formalized,',         // 37
  'taught in every school,',                                                 // 38
  'and pushed through radio and TV,',                                        // 39
  'until it became the shared voice of 1.4 billion people.',                 // 40
  'And they gave it a new, surprisingly humble name: putonghua.',            // 41
  'Which means, simply, common speech.',                                     // 42
  'Everyday, ordinary talk.',                                                // 43
  'So the exotic, powerful name the West knows,',                            // 44
  'to a billion speakers back home,',                                        // 45
  "it's just normal language.",                                              // 46
  'Wanna actually start learning Chinese?',                                  // 47
  'Discover thousands of free exercises and more learning content on stacktags.io.', // 48
];

// short windows that stay inside Gemini's accurate range; overlap at the seams
const CHUNKS = [
  { start: 0,   end: 42,   p0: 0,  p1: 16 },
  { start: 33,  end: 72,   p0: 17, p1: 30 },
  { start: 64,  end: 103,  p0: 31, p1: 41 },
  { start: 100, end: 124.5, p0: 42, p1: 48 },
];

async function alignChunk(c) {
  const tmp = path.join(__dirname, `_chunk_${c.start}.mp3`);
  execFileSync('ffmpeg', ['-y', '-i', AUDIO, '-ss', String(c.start), '-to', String(c.end), '-c:a', 'libmp3lame', '-q:a', '4', tmp], { stdio: 'ignore' });
  const b64 = fs.readFileSync(tmp).toString('base64');
  const phrases = PHRASES.slice(c.p0, c.p1 + 1);
  const prompt = 'You are a precise forced-alignment tool. The attached audio is one short slice of a narration. '
    + 'Below are the ordered phrases spoken in THIS slice. For each, return its START time in SECONDS (float) relative to '
    + 'the START OF THIS SLICE (the slice begins at 0.0). Times strictly increasing. Return ONLY a JSON array of numbers, in order.\n\nPHRASES:\n'
    + phrases.map((p, i) => `${i}: ${p}`).join('\n');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`;
  const body = { contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'audio/mpeg', data: b64 } }] }], generationConfig: { temperature: 0, responseMimeType: 'application/json' } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  fs.unlinkSync(tmp);
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  const arr = JSON.parse(j.candidates?.[0]?.content?.parts?.[0]?.text || '[]');
  return arr.map((t, i) => ({ idx: c.p0 + i, t: +(+t + c.start).toFixed(2) }));
}

(async () => {
  const merged = new Map(); // idx -> t (later chunks win the overlap? prefer first occurrence which is earlier in its chunk)
  for (const c of CHUNKS) {
    const res = await alignChunk(c);
    res.forEach(({ idx, t }) => { if (!merged.has(idx)) merged.set(idx, t); });
    console.log(`chunk ${c.start}-${c.end}: ${res.length} phrases`);
  }
  const out = PHRASES.map((p, i) => ({ t: merged.has(i) ? merged.get(i) : null, text: p }));
  // enforce monotonic (clamp any out-of-order to previous + small)
  for (let i = 1; i < out.length; i++) if (out[i].t != null && out[i - 1].t != null && out[i].t <= out[i - 1].t) out[i].t = +(out[i - 1].t + 0.4).toFixed(2);
  fs.writeFileSync(path.resolve(__dirname, 'gemini_align.json'), JSON.stringify(out, null, 2));
  console.log('\n' + out.map(o => `${(o.t == null ? 'NULL' : o.t.toFixed(2)).padStart(7)}  ${o.text}`).join('\n'));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
