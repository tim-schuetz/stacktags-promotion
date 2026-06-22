// Generate the narration via ElevenLabs (Liam – Viral Short-Form Storyteller).
// Saves ../script_voice.mp3 (sibling of skript_text.txt's video folder).
const fs = require('fs');
const path = require('path');

const API_KEY = 'sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8';
const VOICE_ID = 'VCgLBmBjldJmfphyB8sZ'; // Liam – Viral Short-Form Storyteller

// Spoken lines only (brackets/headers stripped), in order.
const TEXT = [
  "There's a company that makes more money per employee than almost anyone on Earth.",
  "Around a hundred staff. Billions in annual profit. And the entire business model is this: you give them a dollar, they hand you a token — and they keep the dollar.",
  "That's Tether. And it's completely legal. Here's why it might be the most genius business model ever invented.",
  "Tether runs USDT — a stablecoin. One USDT is always meant to equal one US dollar.",
  "Crypto traders love it: it's a dollar that lives on the blockchain, so they can jump in and out of trades instantly.",
  "To get one, you hand Tether a real dollar, and they mint you a token.",
  "Simple. But the magic isn't the token — it's what happens to your dollar.",
  "Because Tether doesn't just let your dollar sit in a drawer.",
  "It takes all those billions and parks them mostly in US Treasury bills — basically the safest loan on the planet — earning around 4 to 5% a year.",
  "And how much of that interest do they pass back to you, the token holder?",
  "Zero. You're holding a dollar that pays you nothing — and Tether keeps every cent of the yield.",
  "Now multiply it. There's well over a hundred billion dollars of USDT out there — which means well over a hundred billion of other people's money, working for Tether, for free.",
  "And normally, getting capital is expensive: a bank pays interest to its depositors, a company pays interest on its bonds. Everyone pays for money.",
  "Tether's cost? Nothing.",
  "It's an interest-free loan from millions of users — and it keeps 100% of the return. In 2024, the company reported around 13 billion dollars in profit, with a team you could fit in a single room.",
  "So what's the catch? Trust.",
  "The whole thing holds up only as long as people believe every token is really backed by a real dollar — and don't all rush to cash out at once.",
  "Tether has been fined before for overstating what was actually in its reserves, and it publishes attestations, not full independent audits.",
  "The model is brilliant. But it runs entirely on confidence.",
  "Still — it cracked something most people never even see. The most profitable trade in finance wasn't picking the right stock, or the right coin.",
  "It was realizing that if you get to issue the dollar... you get to keep the interest.",
  "Want more business models that sound illegal but aren't? Follow Stacktags.",
].join(' ');

const OUT = path.resolve(__dirname, '../../script_voice.mp3');

(async () => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  const body = {
    text: TEXT,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.42, similarity_boost: 0.8, style: 0.28, use_speaker_boost: true },
  };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`ElevenLabs failed: ${r.status} ${t.slice(0, 400)}`);
  }
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(OUT, buf);
  console.log(`✓ wrote ${OUT} (${Math.round(buf.length / 1024)} KB)`);
})().catch((e) => { console.error('✗', e.message); process.exit(1); });
