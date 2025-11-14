// public/js/sabbath_handler.js
(function () {
  // Lightweight Sabbath handler for WebXR clients.
  // Listens to the existing /ws websocket and reacts to 'blockAdded' events
  // with payload.meta.type === 'sabbath'.

  function ensureOverlay() {
    let o = document.getElementById('sabbath-overlay');
    if (!o) {
      o = document.createElement('div');
      o.id = 'sabbath-overlay';
      Object.assign(o.style, {
        position: 'fixed',
        left: '12px',
        bottom: '12px',
        padding: '8px 12px',
        background: 'rgba(2,34,71,0.85)',
        color: '#BDE6FF',
        borderRadius: '8px',
        zIndex: 99999,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '13px'
      });
      document.body.appendChild(o);
    }
    return o;
  }

  function showOverlay(text) {
    const o = ensureOverlay();
    o.textContent = text;
    o.style.display = 'block';
  }

  function hideOverlay() {
    const o = document.getElementById('sabbath-overlay');
    if (o) o.style.display = 'none';
  }

  function pauseAllAudio() {
    document.querySelectorAll('audio,video').forEach(el => {
      try { el.pause(); } catch (e) {}
    });
  }

  function resumeAllAudio() {
    document.querySelectorAll('audio,video').forEach(el => {
      try { if (el.dataset.sabbathPaused) { el.play(); delete el.dataset.sabbathPaused; } } catch (e) {}
    });
  }

  function dispatchPause() {
    window.dispatchEvent(new CustomEvent('sabbath:pause'));
  }
  function dispatchResume() {
    window.dispatchEvent(new CustomEvent('sabbath:resume'));
  }

  function pauseClient(mode, timestamp) {
    document.documentElement.classList.add('sabbath-mode');
    pauseAllAudio();
    dispatchPause();
    showOverlay(`SABBATH MODE — Protected (${mode}) since ${timestamp}`);
  }

  function resumeClient(timestamp) {
    document.documentElement.classList.remove('sabbath-mode');
    resumeAllAudio();
    dispatchResume();
    showOverlay(`SABBATH MODE — Ended at ${timestamp}`);
    setTimeout(hideOverlay, 5000);
  }

  function connectWs() {
    try {
      const protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
      const wsUrl = protocol + location.host + '/ws';
      const ws = new WebSocket(wsUrl);
      ws.addEventListener('open', () => {
        console.log('SabbathHandler: connected to', wsUrl);
      });
      ws.addEventListener('message', ev => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg && msg.type === 'blockAdded' && msg.payload && msg.payload.meta && msg.payload.meta.type === 'sabbath') {
            const meta = msg.payload.meta || {};
            if (meta.mode === 'on') pauseClient(meta.mode, meta.timestamp || new Date().toISOString());
            else resumeClient(meta.timestamp || new Date().toISOString());
          }
        } catch (e) {
          // ignore malformed messages
        }
      });
      ws.addEventListener('close', () => {
        // try reconnect with backoff
        setTimeout(connectWs, 2000);
      });
      ws.addEventListener('error', () => {
        ws.close();
      });
    } catch (e) {
      console.warn('SabbathHandler: websocket init failed', e);
    }
  }

  // init
  if (typeof window !== 'undefined') {
    // expose API
    window.SabbathHandler = {
      pause: pauseClient,
      resume: resumeClient
    };
    // start ws listener
    connectWs();
  }
})();