// Free neural text-to-speech proxy for the read-aloud player.
// Uses Microsoft's Edge Read Aloud endpoint via msedge-tts (no API key,
// no paid service). POST or GET with { text, voice, rate } -> audio/mpeg.
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const VOICE_RE = /^[a-z]{2,3}-[A-Z]{2}-[A-Za-z0-9]+$/;
const MAX_TEXT = 3000; // client chunks well below this
const DEFAULT_VOICE = 'en-US-AvaMultilingualNeural';

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      res.status(405).json({ error: 'method not allowed' });
      return;
    }
    const params = req.method === 'POST' ? (req.body || {}) : (req.query || {});
    const text = String(params.text || '').trim();
    const voice = String(params.voice || DEFAULT_VOICE);
    let rate = parseFloat(params.rate);
    if (!isFinite(rate)) rate = 1;
    rate = Math.min(2, Math.max(0.5, rate));

    if (!text) {
      res.status(400).json({ error: 'text is required' });
      return;
    }
    if (text.length > MAX_TEXT) {
      res.status(413).json({ error: 'text too long', max: MAX_TEXT, got: text.length });
      return;
    }
    if (!VOICE_RE.test(voice)) {
      res.status(400).json({ error: 'invalid voice' });
      return;
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(text, { rate });

    const chunks = [];
    let settled = false;
    const fail = (code, msg) => {
      if (settled) return;
      settled = true;
      try { tts.close(); } catch (e) {}
      if (!res.headersSent) res.status(code).json({ error: msg });
    };

    audioStream.on('data', (d) => chunks.push(d));
    audioStream.on('error', (err) => fail(502, 'tts upstream: ' + String((err && err.message) || err)));
    audioStream.on('close', () => {
      if (settled) return;
      settled = true;
      try { tts.close(); } catch (e) {}
      const buf = Buffer.concat(chunks);
      if (!buf.length) {
        if (!res.headersSent) res.status(502).json({ error: 'upstream returned no audio' });
        return;
      }
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      res.status(200).send(buf);
    });
  } catch (e) {
    if (!res.headersSent) res.status(500).json({ error: String((e && e.message) || e) });
  }
};
