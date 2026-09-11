/* Read-aloud player: free natural voices via /api/tts (Microsoft Edge neural
   TTS, proxied by a serverless function in this repo - no API key, no paid
   service). Adds a floating player on every docs page that reads the article
   content aloud: play/pause/stop, voice picker, speed, and paragraph
   highlighting. Choices persist in localStorage. */
(function () {
  'use strict';

  var VOICE_KEY = 'pstack.readAloud.voice';
  var RATE_KEY = 'pstack.readAloud.rate';
  var API = '/api/tts/'; // trailing slash: vercel.json trailingSlash 308s the bare path
  var CHUNK_MAX = 700; // chars per TTS request; keeps latency + rate limits sane

  var VOICES = [
    ['en-US-AvaMultilingualNeural', 'Ava (US)'],
    ['en-US-AndrewMultilingualNeural', 'Andrew (US)'],
    ['en-US-EmmaMultilingualNeural', 'Emma (US)'],
    ['en-US-BrianMultilingualNeural', 'Brian (US)'],
    ['en-US-AriaNeural', 'Aria (US)'],
    ['en-US-GuyNeural', 'Guy (US)'],
    ['en-US-JennyNeural', 'Jenny (US)'],
    ['en-US-ChristopherNeural', 'Christopher (US)'],
    ['en-GB-SoniaNeural', 'Sonia (UK)'],
    ['en-GB-RyanNeural', 'Ryan (UK)'],
    ['en-AU-NatashaNeural', 'Natasha (AU)'],
    ['en-AU-WilliamNeural', 'William (AU)']
  ];

  var chunks = [];   // [{ text, els, url, promise }]
  var idx = 0;
  var state = 'idle'; // idle | loading | playing | paused
  var gen = 0;        // guards against stale async callbacks
  var audio = null;
  var aborter = null;

  function $(id) { return document.getElementById(id); }

  function currentVoice() {
    var saved = null;
    try { saved = localStorage.getItem(VOICE_KEY); } catch (e) {}
    var sel = $('ra-voice');
    return (sel && sel.value) || saved || VOICES[0][0];
  }

  function currentRate() {
    var r = 1;
    try { r = parseFloat(localStorage.getItem(RATE_KEY)) || 1; } catch (e) {}
    return r;
  }

  /* The article body in MkDocs Material lives in .md-content__inner. */
  function collectBlocks() {
    var root = document.querySelector('.md-content__inner');
    if (!root) return [];
    var sel = 'h1,h2,h3,h4,h5,h6,p,li,blockquote';
    var all = Array.prototype.slice.call(root.querySelectorAll(sel));
    return all
      .filter(function (el) {
        var p = el.parentElement;
        while (p && p !== root) {
          if (p.matches && p.matches(sel)) return false;
          p = p.parentElement;
        }
        return true;
      })
      .map(function (el) {
        return { el: el, text: (el.innerText || '').replace(/\s+/g, ' ').trim() };
      })
      .filter(function (b) { return b.text.length > 1; });
  }

  /* Group consecutive blocks into request-sized chunks, keeping element refs
     for highlighting. */
  function buildChunks() {
    var blocks = collectBlocks();
    chunks = [];
    var cur = null;
    blocks.forEach(function (b) {
      if (!cur || (cur.text.length + b.text.length + 1) > CHUNK_MAX) {
        cur = { text: b.text, els: [b.el], url: null, promise: null };
        chunks.push(cur);
      } else {
        cur.text += ' ' + b.text;
        cur.els.push(b.el);
      }
    });
  }

  function highlight(chunk, on) {
    chunk.els.forEach(function (el) {
      el.classList.toggle('ra-reading', !!on);
    });
  }

  function clearAllHighlights() {
    chunks.forEach(function (c) { highlight(c, false); });
  }

  function fetchChunk(i) {
    var c = chunks[i];
    if (!c) return Promise.resolve(null);
    if (c.url) return Promise.resolve(c.url);
    if (c.promise) return c.promise;
    var myGen = gen;
    c.promise = fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: c.text, voice: currentVoice(), rate: currentRate() }),
      signal: aborter ? aborter.signal : undefined
    }).then(function (res) {
      if (!res.ok) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          throw new Error(body.error || ('HTTP ' + res.status));
        });
      }
      return res.blob();
    }).then(function (blob) {
      if (myGen !== gen) return null;
      if (!blob || !blob.size) throw new Error('empty audio');
      c.url = URL.createObjectURL(blob);
      return c.url;
    }).catch(function (err) {
      c.promise = null;
      if (err && err.name === 'AbortError') return null;
      throw err;
    });
    return c.promise;
  }

  function prefetchNext(i) {
    var n = chunks[i + 1];
    if (n && !n.url && !n.promise) {
      fetchChunk(i + 1).catch(function () { /* retried on demand */ });
    }
  }

  function dropCacheFrom(i) {
    for (var k = i; k < chunks.length; k++) {
      var c = chunks[k];
      if (c.url) { URL.revokeObjectURL(c.url); c.url = null; }
      c.promise = null;
      c._retried = null;
    }
  }

  function playChunk(i) {
    var myGen = gen;
    if (i >= chunks.length) { stopAll(); return; }
    idx = i;
    state = 'loading';
    syncUI();
    fetchChunk(i).then(function (url) {
      if (myGen !== gen || url === null) return;
      if (state !== 'loading' && state !== 'playing') return;
      state = 'playing';
      syncUI();
      clearAllHighlights();
      highlight(chunks[i], true);
      chunks[i].els[0].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      audio.src = url;
      var p = audio.play();
      if (p && p.catch) p.catch(function (err) { onError(err); });
      prefetchNext(i);
    }).catch(function (err) {
      if (myGen !== gen) return;
      onError(err);
    });
  }

  function onError(err) {
    // One silent retry of the current chunk, then give up with a visible state.
    var c = chunks[idx];
    if (c && !c._retried) {
      c._retried = true;
      setTimeout(function () {
        if (state === 'loading' || state === 'playing') playChunk(idx);
      }, 1200);
      return;
    }
    state = 'idle';
    var fab = $('ra-fab');
    if (fab) {
      fab.title = 'Read aloud failed: ' + ((err && err.message) || err) + ' - click to retry';
      fab.classList.add('ra-error');
      setTimeout(function () { fab.classList.remove('ra-error'); fab.title = 'Read aloud'; }, 4000);
    }
    clearAllHighlights();
    syncUI();
  }

  function play() {
    if (!chunks.length) buildChunks();
    if (!chunks.length) return;
    if (state === 'paused') {
      state = 'playing';
      var p = audio.play();
      if (p && p.catch) p.catch(function (err) { onError(err); });
      syncUI();
      return;
    }
    if (state === 'playing' || state === 'loading') return;
    gen++;
    aborter = new AbortController();
    playChunk(idx);
  }

  function pause() {
    if (state !== 'playing') return;
    state = 'paused';
    audio.pause();
    syncUI();
  }

  function stopAll() {
    gen++;
    state = 'idle';
    idx = 0;
    if (aborter) { try { aborter.abort(); } catch (e) {} aborter = null; }
    if (audio) { audio.pause(); audio.removeAttribute('src'); }
    dropCacheFrom(0);
    clearAllHighlights();
    syncUI();
  }

  var ICONS = {
    speaker: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
    play: 'M8 5v14l11-7z',
    pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
    stop: 'M6 6h12v12H6z'
  };

  function icon(name) {
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="' + ICONS[name] + '"/></svg>';
  }

  function syncUI() {
    var fab = $('ra-fab');
    var playBtn = $('ra-playpause');
    var rateBtn = $('ra-rate');
    if (playBtn) {
      playBtn.innerHTML = icon(state === 'playing' ? 'pause' : 'play');
      playBtn.setAttribute('aria-label', state === 'playing' ? 'Pause reading' : 'Play reading');
      playBtn.title = state === 'playing' ? 'Pause' : 'Play';
    }
    if (fab) {
      fab.classList.toggle('ra-active', state === 'playing' || state === 'paused');
      fab.classList.toggle('ra-loading', state === 'loading');
    }
    if (rateBtn) rateBtn.textContent = currentRate() + 'x';
  }

  function buildUI() {
    if ($('ra-player')) return;
    var wrap = document.createElement('div');
    wrap.id = 'ra-player';
    wrap.className = 'ra-player';
    var opts = VOICES.map(function (v) {
      return '<option value="' + v[0] + '">' + v[1] + '</option>';
    }).join('');
    wrap.innerHTML =
      '<div class="ra-panel" id="ra-panel" hidden>' +
        '<select id="ra-voice" class="ra-voice" aria-label="Voice" title="Voice">' + opts + '</select>' +
        '<button id="ra-playpause" class="ra-btn" type="button" aria-label="Play reading">' + icon('play') + '</button>' +
        '<button id="ra-stop" class="ra-btn" type="button" aria-label="Stop reading" title="Stop">' + icon('stop') + '</button>' +
        '<button id="ra-rate" class="ra-btn ra-rate" type="button" aria-label="Playback speed" title="Speed">1x</button>' +
      '</div>' +
      '<button id="ra-fab" class="ra-fab" type="button" aria-label="Read this page aloud" title="Read aloud">' + icon('speaker') + '</button>';
    document.body.appendChild(wrap);

    audio = new Audio();
    audio.addEventListener('ended', function () {
      if (state === 'playing') playChunk(idx + 1);
    });
    audio.addEventListener('error', function () {
      if (!audio.error) return; // spurious event (e.g. src cleared while paused)
      if (state === 'playing' || state === 'loading') onError(new Error('audio playback failed (' + audio.error.code + ')'));
    });

    var savedVoice = null;
    try { savedVoice = localStorage.getItem(VOICE_KEY); } catch (e) {}
    if (savedVoice) $('ra-voice').value = savedVoice;

    $('ra-fab').addEventListener('click', function () {
      var panel = $('ra-panel');
      var opening = panel.hidden;
      panel.hidden = !opening;
      if (opening && state === 'idle') play();
    });
    $('ra-playpause').addEventListener('click', function () {
      if (state === 'playing') pause(); else play();
    });
    $('ra-stop').addEventListener('click', function () {
      stopAll();
    });
    $('ra-rate').addEventListener('click', function () {
      var rates = [0.75, 1, 1.25, 1.5, 2];
      var cur = currentRate();
      var next = rates[(rates.indexOf(cur) + 1) % rates.length];
      try { localStorage.setItem(RATE_KEY, String(next)); } catch (e) {}
      dropCacheFrom(idx); // audio changes with speed
      if (state === 'playing' || state === 'paused' || state === 'loading') {
        var keep = idx;
        gen++;
        aborter = new AbortController();
        playChunk(keep);
      }
      syncUI();
    });
    $('ra-voice').addEventListener('change', function () {
      try { localStorage.setItem(VOICE_KEY, $('ra-voice').value); } catch (e) {}
      dropCacheFrom(idx); // audio changes with voice
      if (state === 'playing' || state === 'paused' || state === 'loading') {
        var keep = idx;
        gen++;
        aborter = new AbortController();
        playChunk(keep);
      }
    });

    syncUI();
  }

  // MkDocs Material swaps page content on instant navigation: reset the
  // player so it reads the new page, not the old one.
  function onPage() {
    if (state !== 'idle') stopAll();
    chunks = [];
    idx = 0;
    audio = null;
    buildUI();
  }

  if (window.document$ && typeof window.document$.subscribe === 'function') {
    window.document$.subscribe(onPage);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onPage);
  } else {
    onPage();
  }
})();
