/* Read-aloud player: uses the browser's built-in speech synthesis.
   Free, no backend. Adds a floating player on every docs page that reads
   the article content aloud, with play/pause/stop and a voice picker
   (choice persisted in localStorage). */
(function () {
  'use strict';

  if (!('speechSynthesis' in window)) return;

  var VOICE_KEY = 'pstack.readAloud.voice';
  var RATE_KEY = 'pstack.readAloud.rate';

  var blocks = [];
  var idx = 0;
  var state = 'idle'; // idle | playing | paused
  var gen = 0; // guards against stale utterance callbacks
  var voices = [];

  function $(id) { return document.getElementById(id); }

  /* The article body in MkDocs Material lives in .md-content__inner. */
  function collectBlocks() {
    var root = document.querySelector('.md-content__inner');
    if (!root) return [];
    var sel = 'h1,h2,h3,h4,h5,h6,p,li,blockquote';
    var all = Array.prototype.slice.call(root.querySelectorAll(sel));
    return all
      .filter(function (el) {
        // drop elements nested inside another matched element (li in li, etc.)
        var p = el.parentElement;
        while (p && p !== root) {
          if (p.matches && p.matches(sel)) return false;
          p = p.parentElement;
        }
        return true;
      })
      .map(function (el) {
        return (el.innerText || '').replace(/\s+/g, ' ').trim();
      })
      .filter(function (t) { return t.length > 1; });
  }

  function loadVoices() {
    var all = speechSynthesis.getVoices() || [];
    var en = all.filter(function (v) {
      return (v.lang || '').toLowerCase().replace('_', '-').indexOf('en') === 0;
    });
    voices = en.length ? en : all;
    renderVoiceOptions();
  }

  function renderVoiceOptions() {
    var sel = $('ra-voice');
    if (!sel || !voices.length) return;
    var saved = null;
    try { saved = localStorage.getItem(VOICE_KEY); } catch (e) {}
    sel.innerHTML = '';
    voices.forEach(function (v, i) {
      var opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = v.name + ' (' + v.lang + ')';
      sel.appendChild(opt);
      if (saved && (v.name + '|' + v.lang) === saved) sel.value = String(i);
    });
  }

  function selectedVoice() {
    var sel = $('ra-voice');
    var i = sel ? parseInt(sel.value, 10) : -1;
    return voices[i] || null;
  }

  function selectedRate() {
    var r = 1;
    try { r = parseFloat(localStorage.getItem(RATE_KEY)) || 1; } catch (e) {}
    return r;
  }

  function speakCurrent() {
    if (idx >= blocks.length) { stopAll(); return; }
    var myGen = gen;
    var u = new SpeechSynthesisUtterance(blocks[idx]);
    var v = selectedVoice();
    if (v) u.voice = v;
    u.rate = selectedRate();
    u.onend = function () {
      if (myGen !== gen) return;
      if (state === 'playing') { idx++; speakCurrent(); }
    };
    u.onerror = function (e) {
      if (myGen !== gen) return;
      if (e && (e.error === 'interrupted' || e.error === 'canceled')) return;
      if (state === 'playing') { idx++; speakCurrent(); }
    };
    speechSynthesis.speak(u);
  }

  function play() {
    if (!blocks.length) blocks = collectBlocks();
    if (!blocks.length) return;
    if (state === 'paused') {
      state = 'playing';
      speechSynthesis.resume();
    } else if (state !== 'playing') {
      gen++;
      state = 'playing';
      speechSynthesis.cancel();
      speakCurrent();
    }
    syncUI();
  }

  function pause() {
    if (state !== 'playing') return;
    state = 'paused';
    speechSynthesis.pause();
    syncUI();
  }

  function stopAll() {
    gen++;
    state = 'idle';
    idx = 0;
    try { speechSynthesis.cancel(); } catch (e) {}
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
      fab.classList.toggle('ra-active', state !== 'idle');
    }
    if (rateBtn) rateBtn.textContent = selectedRate() + 'x';
  }

  function buildUI() {
    if ($('ra-player')) return;
    var wrap = document.createElement('div');
    wrap.id = 'ra-player';
    wrap.className = 'ra-player';
    wrap.innerHTML =
      '<div class="ra-panel" id="ra-panel" hidden>' +
        '<select id="ra-voice" class="ra-voice" aria-label="Voice" title="Voice"></select>' +
        '<button id="ra-playpause" class="ra-btn" type="button" aria-label="Play reading">' + icon('play') + '</button>' +
        '<button id="ra-stop" class="ra-btn" type="button" aria-label="Stop reading" title="Stop">' + icon('stop') + '</button>' +
        '<button id="ra-rate" class="ra-btn ra-rate" type="button" aria-label="Playback speed" title="Speed">1x</button>' +
      '</div>' +
      '<button id="ra-fab" class="ra-fab" type="button" aria-label="Read this page aloud" title="Read aloud">' + icon('speaker') + '</button>';
    document.body.appendChild(wrap);

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
      var rates = [1, 1.25, 1.5, 2];
      var cur = selectedRate();
      var next = rates[(rates.indexOf(cur) + 1) % rates.length];
      try { localStorage.setItem(RATE_KEY, String(next)); } catch (e) {}
      syncUI();
      if (state === 'playing') {
        // restart current block at the new speed
        var keep = idx;
        gen++;
        speechSynthesis.cancel();
        idx = keep;
        speakCurrent();
      }
    });
    $('ra-voice').addEventListener('change', function () {
      var v = selectedVoice();
      if (v) {
        try { localStorage.setItem(VOICE_KEY, v.name + '|' + v.lang); } catch (e) {}
      }
      if (state === 'playing') {
        var keep = idx;
        gen++;
        speechSynthesis.cancel();
        idx = keep;
        speakCurrent();
      }
    });

    loadVoices();
    if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    syncUI();
  }

  // MkDocs Material swaps the page content on instant navigation, so rebuild
  // the player if it was replaced and stop reading the old page.
  function onPage() {
    if (state !== 'idle') stopAll();
    blocks = [];
    idx = 0;
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
