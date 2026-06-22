// Generate the narration via ElevenLabs (voice: Liam – Viral Short-Form Storyteller).
// Spoken text only (the [bracketed] visual notes are stripped). Output → ../../script_voice.mp3
const fs = require('fs');
const path = require('path');

const KEY = 'sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8';
const VOICE = 'VCgLBmBjldJmfphyB8sZ';   // Liam – Viral Short-Form Storyteller
const OUT = path.resolve(__dirname, '../../script_voice.mp3');

const TEXT = `There are now millions of different cryptocurrencies. Not thousands — millions. And it all started because the very first one, Bitcoin, was simply too slow.

Bitcoin was the original — brilliant as digital money. But it's limited. It's slow, and it can basically do just one thing: move bitcoin. You can't really build anything on top of it. So people wanted more.

That's where Ethereum came in. It added "smart contracts" — little programs that run on the blockchain itself. Suddenly a blockchain could host apps, not just payments. And crucially, anyone could create their own token on top of Ethereum with just a few lines of code. The floodgates cracked open.

Then Ethereum got so popular it became slow and expensive to use. So a wave of rival blockchains launched, each promising to be faster or cheaper — Solana, BNB, and many more. And every single one comes with its own coin.

And finally, it became trivial to make a coin at all. Platforms like Pump.fun let anyone launch a token in seconds, for almost nothing. The result: a flood of memecoins — coins based on jokes, dogs, celebrities — most with no purpose beyond speculation, and most worthless within days.

So why are there millions of coins? Because crypto kept fixing its own limitations — and each fix made it easier for anyone to mint the next one. We went from one careful experiment... to a button that spits out a new currency in seconds. Just remember: almost none of them are worth anything.

Want more of how crypto really works? Follow Stacktags.`;

(async () => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`;
  const body = {
    text: TEXT,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.42, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
  };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  if (!r.ok) { console.error('TTS failed', r.status, await r.text()); process.exit(1); }
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(OUT, buf);
  console.log('SAVED', OUT, Math.round(buf.length / 1024), 'KB');
})().catch((e) => { console.error(e); process.exit(1); });
