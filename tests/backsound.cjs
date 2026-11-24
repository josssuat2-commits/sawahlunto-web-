const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
(async () => {
  let page = 'login', popup = '', audio, observer, now = 0, frameId = 0, rejectPlay = false;
  const frames = new Map(), events = {}, windowEvents = {}, stored = new Map(), media = {};
  class AudioMock {
    constructor() { audio = this; this.paused = true; this.currentTime = 0; this.duration = 180; }
    play() { if (rejectPlay) return Promise.reject(Object.assign(Error('gesture required'), { name:'NotAllowedError' })); this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    addEventListener(name, fn) { media[name] = fn; }
  }
  const document = { hidden:false, body:{matches:() => page === 'letter'},
    getElementById:() => ({classList:{contains:() => popup === 'letter'}}),
    querySelector: selector => popup === 'relic' || (popup === 'settings' && !selector.includes(':not(#settingsDialog)')) ? {} : null,
    addEventListener:(name,fn) => { events[name] = fn; } };
  const app = { location:{}, addEventListener:(name,fn) => { windowEvents[name] = fn; } };
  vm.runInNewContext(fs.readFileSync('js/backsound.js','utf8'), { Audio:AudioMock, document, window:app, console,
    performance:{now:() => now}, requestAnimationFrame:fn => { const id = ++frameId; frames.set(id,fn); return id; }, cancelAnimationFrame:id => frames.delete(id),
    localStorage:{getItem:key => stored.get(key) ?? null,setItem:(key,value) => stored.set(key,value)},
    MutationObserver:class { constructor(fn) { observer=fn; } observe() {} } });
  const settle = async () => { await Promise.resolve(); await Promise.resolve(); };
  async function advance(ms) { now += ms; const batch = [...frames.values()]; frames.clear(); batch.forEach(fn => fn(now)); await settle(); }
  rejectPlay=true; events.DOMContentLoaded(); await settle(); assert.equal(audio.paused,true);
  rejectPlay=false; events.click(); await settle();
  assert.equal(audio.volume,0); await advance(450); assert.ok(audio.volume>0 && audio.volume<0.35);
  await advance(450); assert.equal(audio.volume,0.35);
  popup='settings'; observer(); assert.match(audio.src,/backsound_2/);
  popup='letter'; audio.currentTime=12; observer();
  assert.match(audio.src,/backsound_2/,'old track remains during fade out');
  await advance(275); assert.ok(audio.volume>0 && audio.volume<0.35);
  await advance(275); assert.match(audio.src,/backsound_1/); assert.equal(audio.volume,0);
  await advance(900); assert.equal(audio.volume,0.35);
  popup='relic'; observer(); await advance(200);
  popup=''; observer(); await advance(550); assert.match(audio.src,/backsound_2/,'latest popup target wins');
  media.loadedmetadata(); assert.equal(audio.currentTime,12); await advance(900);
  app.SawahluntoAudio.setVolume(70); assert.equal(app.SawahluntoAudio.getVolume(),70); assert.equal(stored.get('sawahlunto_music_volume'),'0.7');
  app.SawahluntoAudio.setVolume(0); assert.equal(audio.paused,true); events.click(); assert.equal(audio.paused,true);
  app.SawahluntoAudio.setVolume(70); await settle(); await advance(900); assert.equal(audio.volume,0.7);
  document.hidden=true; events.visibilitychange(); assert.equal(audio.paused,true); assert.equal(frames.size,0);
  document.hidden=false; events.visibilitychange(); await settle(); await advance(900);
  const leaving=app.SawahluntoAudio.navigate('surat_page.html'); assert.equal(app.location.href,undefined);
  await advance(225); assert.ok(audio.volume>0 && audio.volume<0.7); assert.equal(app.location.href,undefined);
  await advance(225); await leaving; assert.equal(app.location.href,'surat_page.html'); assert.equal(audio.paused,true);
  console.log('PASS: fade-in/out, rapid popup changes, settings exclusion, saved positions/volume, autoplay retry, mute, hidden page, and faded navigation.');
})().catch(error => { console.error(error); process.exitCode=1; });
