// One player fades out before switching tracks, then fades in after playback starts.
document.addEventListener('DOMContentLoaded', () => {
  const player = new Audio();
  player.loop = true;
  player.preload = 'metadata';
  let volume = 0.35;
  try {
    const saved = localStorage.getItem('sawahlunto_music_volume');
    if (saved !== null && Number.isFinite(Number(saved))) volume = Math.max(0, Math.min(1, Number(saved)));
  } catch {}
  const positions = new Map();
  let current = 0, requested = 0, gain = 0, frame = 0, fadeTarget = null;
  let playingRequest = false, leaving = false;
  let navigation = null;
  player.volume = 0;
  function trackForView() {
    if (document.getElementById('scrollInspectionModal')?.classList.contains('active')) return 1;
    if (document.querySelector('dialog[open]:not(#settingsDialog), #inspectionModal.active, #albumInspectionModal.active, #mapInspectionModal.active, #lanternInspectionModal.active')) return 3;
    return document.body.matches('.page-surat, .page-surat-terbuka') ? 1 : 2;
  }
  function cancelFade() {
    cancelAnimationFrame(frame); frame = 0; fadeTarget = null;
  }
  function fade(to, duration, done = () => {}) {
    if (fadeTarget === to) return;
    cancelFade(); fadeTarget = to;
    const from = gain, started = performance.now();
    if (Math.abs(from - to) < 0.001) { gain = to; player.volume = volume * gain; fadeTarget = null; done(); return; }
    function step(now) {
      const progress = Math.min(1, (now - started) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      gain = from + (to - from) * eased;
      player.volume = Math.max(0, Math.min(1, volume * gain));
      if (progress < 1) frame = requestAnimationFrame(step);
      else { frame = 0; fadeTarget = null; done(); }
    }
    frame = requestAnimationFrame(step);
  }
  function play() {
    if (playingRequest) return;
    if (!player.paused) { fade(1, 900); return; }
    gain = 0; player.volume = 0; playingRequest = true;
    player.play().then(() => {
      playingRequest = false;
      if (!leaving && !document.hidden && volume > 0 && current === requested) fade(1, 900);
      else if (!leaving) sync();
    }).catch(error => {
      playingRequest = false;
      if (!['NotAllowedError', 'AbortError'].includes(error.name)) console.warn('Musik latar belum dapat diputar:', error.message);
    });
  }
  function loadTrack(next) {
    if (current) positions.set(current, player.currentTime);
    player.pause(); gain = 0; player.volume = 0;
    current = next; player.src = `../sound/backsound_${next}.mp3`;
    if (volume > 0 && !document.hidden && !leaving) play();
  }
  function sync() {
    if (leaving) return;
    const next = trackForView();
    if (document.hidden || volume === 0) {
      cancelFade(); player.pause(); gain = 0; player.volume = 0;
      requested = next;
      if (current !== next) loadTrack(next);
      return;
    }
    if (next !== requested) {
      requested = next;
      // A rapid popup change replaces the pending target without overlapping songs.
      cancelFade();
      if (!current || player.paused) loadTrack(next);
      else if (next === current) fade(1, 900);
      else fade(0, 550, () => loadTrack(requested));
      return;
    }
    if (current !== requested) return;
    play();
  }
  player.addEventListener('loadedmetadata', () => {
    const position = positions.get(current) || 0;
    if (position && position < player.duration) player.currentTime = position;
  });
  document.addEventListener('click', sync, true);
  document.addEventListener('keydown', sync, true);
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'open'] });
  window.addEventListener('pagehide', () => { cancelFade(); player.pause(); gain = 0; });
  window.addEventListener('pageshow', () => { leaving = false; navigation = null; sync(); });
  window.SawahluntoAudio = Object.freeze({
    getVolume: () => Math.round(volume * 100),
    setVolume(value) {
      if (!Number.isFinite(Number(value))) return;
      volume = Math.max(0, Math.min(100, Number(value))) / 100;
      player.volume = volume * gain;
      try { localStorage.setItem('sawahlunto_music_volume', String(volume)); } catch {}
      sync();
    },
    navigate(url) {
      if (navigation) return navigation;
      leaving = true; cancelFade();
      navigation = new Promise(resolve => {
        const finish = () => { player.pause(); window.location.href = url; resolve(); };
        if (document.hidden || player.paused || volume === 0) finish();
        else fade(0, 450, finish);
      });
      return navigation;
    }
  });
  sync();
});
