// Setup: npm.cmd install --prefix .tools-cache/localization --no-save --package-lock=false --ignore-scripts linkedom
// Run: node tests/localization.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { parseHTML } = require('../.tools-cache/localization/node_modules/linkedom');

function loadPage(file, lang = 'id', options = {}) {
  const { window, document } = parseHTML(fs.readFileSync('html/' + file, 'utf8'));
  const stored = options.stored || new Map([['sawahlunto_lang_pref', lang]]);
  const session = options.session || new Map();
  // Most chest tests start after the first letter; direct-entry tests opt out.
  if (file === 'kotak_terbuka_page.html' && options.chestAccess !== false && !options.session) {
    session.set('sawahlunto_letter_opened', 'true');
  }
  const timers = new Map();
  let timerId = 0;
  const storage = map => ({ getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key) });
  window.localStorage = storage(stored);
  window.sessionStorage = storage(session);
  window.location = { href: '', origin: 'http://localhost', pathname: '/html/' + file,
    replace(url) { this.href = url; } };
  const navigator = { onLine: options.online !== false, clipboard: { writeText: async () => {} } };
  window.sawahFirebase = {
    getGuest: async () => options.guest || null,
    saveGuest: options.saveGuest || (async () => ({ uid: 'test-visitor' })),
    signOut: options.signOut || (async () => {})
  };
  window.SawahluntoAudio = { navigate: url => { window.location.href = url; }, getVolume: () => 35, setVolume() {} };
  Object.defineProperty(window.HTMLElement.prototype, 'open', { configurable: true, get() { return this.hasAttribute('open'); } });
  window.HTMLElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  window.HTMLElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new window.Event('close')); };
  window.HTMLElement.prototype.getBoundingClientRect = () => ({ top: 200, bottom: 400, left: 0, right: 800 });
  window.HTMLElement.prototype.focus = function () { document.focusedElement = this; };
  class AudioMock {
    cloneNode() { return new AudioMock(); }
    addEventListener() {}
    play() { return Promise.reject(new Error('Audio disabled in DOM tests')); }
    pause() {}
  }
  const context = vm.createContext({ window, document, localStorage: window.localStorage, sessionStorage: window.sessionStorage,
    navigator, Element: window.Element, CustomEvent: window.CustomEvent, MutationObserver: window.MutationObserver, Audio: AudioMock, URL, console,
    setTimeout: (fn, delay) => { const id = ++timerId; timers.set(id, { fn, delay }); return id; },
    clearTimeout: id => timers.delete(id), requestAnimationFrame: () => 0 });
  for (const script of document.querySelectorAll('script[src]')) {
    const filePath = script.getAttribute('src').split('?')[0];
    if (!filePath.startsWith('../js/') || /\/(?:backsound|maps-config)\.js$/.test(filePath)) continue;
    let source = fs.readFileSync(path.resolve('html', filePath), 'utf8');
    if (options.inspectionAccess && filePath.endsWith('/script.js')) source = source.replace('  // Tutup Modal', '  window.inspectForTest = openInspectionModal;\n  // Tutup Modal');
    vm.runInContext(source, context, { filename: filePath });
  }
  document.dispatchEvent(new window.Event('DOMContentLoaded'));
  const click = selector => {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    assert.ok(element, 'Missing control: ' + selector);
    const event = new window.Event('click', { bubbles: true, cancelable: true });
    event.button = 0;
    element.dispatchEvent(event);
  };
  const submit = selector => document.querySelector(selector).dispatchEvent(new window.Event('submit', { cancelable: true }));
  const flush = async (maximumDelay = 900) => {
    for (let i = 0; i < 8; i++) await Promise.resolve();
    for (const [id, timer] of [...timers]) if (timer.delay <= maximumDelay) { timers.delete(id); timer.fn(); }
    for (let i = 0; i < 8; i++) await Promise.resolve();
  };
  return { window, document, stored, session, click, submit, flush,
    setLanguage: lang => window.SawahluntoSetLanguage(lang),
    text: selector => document.querySelector(selector).textContent.trim() };
}

function assertEnglish(page) {
  const untranslated = /\b(?:buku|tamu|surat|peti|peta|lentera|foto|tutup|kembali|buka|selesai|dari|untuk|yang|silakan|salin|contoh|panduan|pengaturan|sebelumnya|berikutnya|pilih|masuk|nama|warisan|perjalanan|penyelidikan|terkunci|penambang|perbesar|tahun|halaman|ruangan|harus|senyap|maksimal|kurangi|tambah)\b/i;
  const excluded = 'script, style, code, #inspectionDataContainer, #albumDataContainer, #mapDataContainer, #lanternDataContainer, [hidden], [data-language="tansi"], .ticket-tansi-overlay, .credits-files, .credits-file-list';
  const walker = page.document.createTreeWalker(page.document.documentElement, 4);
  let node = walker.nextNode();
  while (node) {
    if (!node.parentElement.closest(excluded)) assert.ok(!untranslated.test(node.nodeValue), 'Untranslated text: ' + node.nodeValue);
    node = walker.nextNode();
  }
  for (const element of page.document.querySelectorAll('[title], [aria-label], [alt], [placeholder], [data-demo]')) {
    if (element.closest(excluded)) continue;
    for (const attribute of ['title', 'aria-label', 'alt', 'placeholder', 'data-demo']) {
      const value = element.getAttribute(attribute);
      if (value) assert.ok(!untranslated.test(value), 'Untranslated ' + attribute + ': ' + value);
    }
  }
}

async function main() {
  const script = fs.readFileSync('js/script.js', 'utf8');
  const dictionary = vm.runInNewContext('(' + script.match(/const I18N_DICT = (\{[\s\S]*?\n  \});/)[1] + ')');
  assert.deepEqual(Object.keys(dictionary.id).sort(), Object.keys(dictionary.en).sort());
  const pages = ['login_page.html', 'surat_page.html', 'surat_terbuka.html', 'kotak_terbuka_page.html', 'panduan_ui.html'];
  for (const file of pages) {
    const page = loadPage(file, 'en');
    assert.equal(page.document.documentElement.lang, 'en', file);
    assert.ok(!/Buku Tamu|Peti Terbuka|Surat Terbuka|Panduan/.test(page.document.title), file + ' title');
    const original = page.document.querySelector('h1')?.innerHTML;
    for (let i = 0; i < 3; i++) { page.setLanguage('id'); page.setLanguage('en'); }
    assert.equal(page.document.querySelector('h1')?.innerHTML, original, file + ' round trip');
    assert.equal(page.stored.get('sawahlunto_lang_pref'), 'en');
    assertEnglish(page);
    for (const element of page.document.querySelectorAll('[data-i18n], [data-i18n-title], [data-i18n-placeholder]')) {
      for (const attribute of ['data-i18n', 'data-i18n-title', 'data-i18n-placeholder']) {
        const key = element.getAttribute(attribute);
        if (key) assert.ok(dictionary.en[key], file + ': missing English key ' + key);
      }
    }
  }
  const shared = new Map([['sawahlunto_lang_pref', 'en']]);
  const firstPage = loadPage('surat_page.html', 'en', { stored: shared });
  firstPage.setLanguage('id');
  const nextPage = loadPage('kotak_terbuka_page.html', 'en', { stored: shared });
  assert.equal(nextPage.document.documentElement.lang, 'id');
  shared.set('sawahlunto_lang_pref', 'en');
  const storageEvent = new nextPage.window.Event('storage'); storageEvent.key = 'sawahlunto_lang_pref';
  nextPage.window.dispatchEvent(storageEvent); assert.equal(nextPage.text('#btnOpenAllItems'), 'Inspect Item');

  const inspection = loadPage('kotak_terbuka_page.html', 'en', { inspectionAccess: true });
  for (const key of ['scroll', 'album', 'map', 'lantern', 'ticket']) {
    inspection.window.inspectForTest(key);
    const english = inspection.text('#inspectionModal');
    assert.match(english, /RELIC INSPECTION ROOM/);
    assert.ok(!/BILIK|REGISTRASI|Kurator|Pemetaan|Selesai|Penambang/.test(english));
    inspection.setLanguage('id'); inspection.setLanguage('en');
    assert.equal(inspection.text('#inspectionModal'), english);
  }

  const login = loadPage('login_page.html', 'en');
  const name = login.document.querySelector('#namaLengkap');
  const institution = login.document.querySelector('#institusi');
  login.submit('#loginForm');
  assert.equal(login.text('#toastText'), 'Please enter your full name.');
  login.setLanguage('id'); assert.equal(login.text('#toastText'), 'Harap masukkan nama lengkap Anda.');
  login.setLanguage('en'); assert.equal(login.text('#toastText'), 'Please enter your full name.');
  name.value = 'Satria'; login.submit('#loginForm');
  assert.equal(login.text('#toastText'), 'Please enter your school or institution.');
  institution.value = 'Universitas Andalas'; name.value = 'a'.repeat(256); login.submit('#loginForm');
  assert.match(login.text('#toastText'), /255 characters or fewer/);
  name.value = 'Satria'; login.submit('#loginForm'); await login.flush();
  assert.match(login.text('#toastText'), /Welcome, Satria/);
  assert.equal(login.window.location.href, 'surat_page.html');

  const offline = loadPage('login_page.html', 'en', { online: false });
  offline.document.querySelector('#namaLengkap').value = 'Visitor'; offline.document.querySelector('#institusi').value = 'Independent';
  offline.submit('#loginForm'); assert.match(offline.text('#toastText'), /internet connection is required/);
  const failed = loadPage('login_page.html', 'en', { saveGuest: async () => { throw Error('offline'); } });
  failed.document.querySelector('#namaLengkap').value = 'Visitor'; failed.document.querySelector('#institusi').value = 'Independent';
  failed.submit('#loginForm'); await failed.flush(); assert.match(failed.text('#toastText'), /could not save your entry/);

  let save;
  const pending = loadPage('login_page.html', 'id', { saveGuest: () => new Promise(resolve => { save = resolve; }) });
  pending.document.querySelector('#namaLengkap').value = 'Visitor'; pending.document.querySelector('#institusi').value = 'Independent';
  pending.submit('#loginForm'); pending.setLanguage('en');
  assert.equal(pending.text('#submitBtn .btn-text'), 'Saving…');
  save({ uid: 'visitor' }); await pending.flush(); assert.match(pending.text('#toastText'), /^Welcome/);

  const room = loadPage('surat_page.html', 'en'); room.click('#envelopeCard');
  assert.match(room.text('#toastText'), /Opening the letter/); await room.flush();
  assert.equal(room.window.location.href, 'surat_terbuka.html');
  const lockedRoom = loadPage('surat_page.html', 'en'); lockedRoom.click('#chestContainer');
  assert.match(lockedRoom.text('.chest-tooltip'), /Open the letter first/);
  assert.equal(lockedRoom.document.querySelector('#chestContainer').tagName, 'BUTTON');
  assert.equal(lockedRoom.document.querySelector('#chestContainer').getAttribute('aria-disabled'), 'true');
  lockedRoom.setLanguage('id'); assert.match(lockedRoom.text('.chest-tooltip'), /Buka surat terlebih dahulu/);
  lockedRoom.setLanguage('en');
  assert.match(lockedRoom.text('#toastText'), /Open the letter first/); await lockedRoom.flush();
  assert.equal(lockedRoom.window.location.href, '');
  const directEntry = loadPage('kotak_terbuka_page.html', 'en', { chestAccess: false });
  assert.equal(directEntry.window.location.href, 'surat_page.html');
  assert.equal(directEntry.document.body.hidden, true);
  const letter = loadPage('surat_terbuka.html', 'en');
  assert.equal(letter.document.querySelector('#chestContainer'), null);
  assert.ok(letter.document.querySelector('.chest-background .chest-image'));
  letter.click('.chest-background'); await letter.flush();
  assert.equal(letter.window.location.href, '');
  const chestRoom = loadPage('surat_page.html', 'en', { session: letter.session });
  chestRoom.click('#chestContainer');
  assert.equal(chestRoom.document.querySelector('#chestContainer').getAttribute('aria-disabled'), 'false');
  assert.match(chestRoom.text('.chest-tooltip'), /Click to Open/);
  assert.match(chestRoom.text('#toastText'), /Opening the chest/); await chestRoom.flush();
  assert.equal(chestRoom.window.location.href, 'kotak_terbuka_page.html');
  lockedRoom.session.set('sawahlunto_letter_opened', 'true');
  lockedRoom.window.dispatchEvent(new lockedRoom.window.Event('pageshow'));
  assert.match(lockedRoom.text('.chest-tooltip'), /Click to Open/);
  assert.match(letter.text('.open-letter-text'), /^Nak, di ranto/);
  letter.click('.btn-document-language');
  assert.match(letter.text('.open-letter-text'), /My child/);
  assert.equal(letter.document.querySelector('.btn-close-letter').getAttribute('href'), 'surat_page.html');

  const chest = loadPage('kotak_terbuka_page.html', 'en');
  assert.equal(chest.document.querySelectorAll('button.inventory-item').length, 5);
  assert.equal(chest.document.querySelector('#itemAlbum').getAttribute('aria-disabled'), 'true');
  chest.click('#itemAlbum'); assert.match(chest.text('#toastText'), /Letter from Father/);
  chest.setLanguage('id'); assert.match(chest.text('#toastText'), /Surat dari Ayah/);
  chest.setLanguage('en'); assert.match(chest.text('#toastText'), /Letter from Father/);
  chest.click('#itemScroll'); assert.match(chest.text('.scroll-letter-text'), /My child/);
  assert.ok(chest.document.querySelector('.scroll-letter-text strong'));
  chest.setLanguage('id'); assert.match(chest.text('.scroll-letter-text'), /^Nak/);
  chest.setLanguage('en'); chest.click('#btnUnlockAlbumStep');
  assert.match(chest.text('#toastText'), /Photo Album is now unlocked/);
  chest.click('#itemAlbum'); assert.equal(chest.document.querySelector('#prototypeGallery').open, true);
  assert.equal(chest.document.querySelector('#itemAlbum').getAttribute('aria-disabled'), 'false');
  for (let i = 0; i < 12; i++) {
    const title = chest.text('#galleryPhotoTitle');
    assert.ok(!/Kota Sawahlunto|Jejak Industri|Silo Batu Bara|Kereta Api dan|Mengenang Para|Rumah untuk/.test(title), title);
    assert.ok(chest.text('#galleryPhotoNote').length > 80);
    chest.setLanguage('id'); chest.setLanguage('en');
    assert.equal(chest.text('#galleryPhotoTitle'), title);
    if (i < 11) chest.click('#nextPhoto');
  }
  chest.click('#previousPhoto'); chest.click('#nextGalleryImage');
  const selectedPhoto = chest.document.querySelector('#galleryPhoto').src;
  chest.click('.gallery-zoom-trigger'); chest.setLanguage('id'); chest.setLanguage('en');
  assert.equal(chest.document.querySelector('#galleryPhoto').src, selectedPhoto);
  assert.equal(chest.document.querySelector('.album-lightbox img').alt, chest.document.querySelector('#galleryPhoto').alt);
  chest.click('#btnUnlockMapStep'); assert.match(chest.text('#toastText'), /Secret Map is now unlocked/);
  chest.click('#itemMap');
  for (let i = 0; i < 6; i++) {
    assert.ok(chest.document.querySelector('#prototypeMapFrame').src.includes('hl=en'));
    assert.ok(!/Selasa|Senin|Setiap|Minggu|Buka|Tutup/.test(chest.text('#prototypeMapHours') + chest.text('#prototypeMapClosed')));
    chest.click('#prototypeMapPhoto2'); const selected = chest.document.querySelector('#prototypeMapPhoto').src;
    chest.setLanguage('id'); chest.setLanguage('en');
    assert.equal(chest.document.querySelector('#prototypeMapPhoto').src, selected);
    assert.match(chest.document.querySelector('#prototypeMapPhoto').alt, /Photo 2/);
    if (i < 5) chest.click('#prototypeMapNext');
  }
  chest.click('#btnUnlockLanternStep'); assert.match(chest.text('#toastText'), /Mining Lantern is now unlocked/);
  chest.click('#itemLantern');
  for (let i = 0; i < 5; i++) {
    assert.ok(!/Kantor|Panorama Kota|Tambang Batu|Lokomotif|Gedung|Penambang/.test(chest.text('#lanternSectionTitle')));
    assert.ok(chest.text('#lanternSectionContent').length > 80);
    const title = chest.text('#lanternSectionTitle'); chest.setLanguage('id'); chest.setLanguage('en');
    assert.equal(chest.text('#lanternSectionTitle'), title);
    if (i < 4) chest.click('#lanternNext');
  }
  chest.click('#btnUnlockTicketStep'); chest.click('#itemTicket');
  assert.equal(chest.document.querySelector('.ticket-visual').hidden, false);
  assert.equal(chest.document.querySelector('.ticket-translation'), null);
  assert.equal(chest.document.querySelector('.ticket-english-overlay'), null);
  chest.setLanguage('id'); assert.equal(chest.document.querySelector('.ticket-visual').hidden, false);
  assert.equal(chest.document.querySelector('.ticket-visual').getAttribute('src'), '../imge/tiket Bahasa Tansi.png');
  chest.setLanguage('en'); assert.match(chest.text('#explorationProgressText'), /5 of 5/);
  assertEnglish(chest);

  chest.click('#ticketDialog .btn-document-language');
  assert.equal(chest.document.querySelector('.ticket-visual').hidden, false);
  assert.equal(chest.document.querySelector('.ticket-visual').getAttribute('src'), '../imge/tiket bahasa indonesia.png');
  assert.equal(chest.document.querySelector('.ticket-tansi-overlay'), null);
  assert.equal(chest.document.querySelector('.ticket-english-overlay'), null);
  assert.equal(chest.stored.get('sawahlunto_lang_pref'), 'en');
  assert.equal(chest.document.querySelector('.scroll-letter-text').dataset.language, 'en');
  chest.click('#ticketDialog .btn-document-language');
  assert.equal(chest.document.querySelector('.ticket-visual').getAttribute('src'), '../imge/tiket Bahasa Tansi.png');
  assert.equal(chest.document.querySelector('.ticket-english-overlay'), null);

  // Tansi is local to each document and never changes the site's language preference.
  for (const [file, host, content, expected] of [
    ['surat_terbuka.html', '.open-letter-content', '.open-letter-text', 'Nak, di ranto...'],
    ['kotak_terbuka_page.html', '.scroll-image-wrapper', '.scroll-letter-text', 'Nak, dari Salunto kito']
  ]) {
    const page = loadPage(file);
    const button = host + ' .btn-document-language';
    assert.ok(page.text(content).startsWith(expected), 'Tansi is the initial reading language');
    const control = page.document.querySelector(button);
    assert.equal(control.getAttribute('aria-pressed'), 'false');
    assert.equal(control.textContent, 'Lihat terjemahan');
    assert.equal(control.querySelector('svg, .lang-badge'), null);
    assert.ok(control.nextElementSibling.classList.contains('document-close-button'), 'Language switch sits beside the close control');
    page.click(button);
    const original = page.text(content);
    assert.equal(control.textContent, 'Baca surat asli');
    assert.ok(!original.startsWith(expected));
    page.click(button);
    assert.ok(page.text(content).startsWith(expected));
    assert.equal(page.stored.get('sawahlunto_lang_pref'), 'id');
    assert.equal(page.document.querySelector(button).getAttribute('aria-pressed'), 'false');
    page.click(button); assert.equal(page.text(content), original);
    page.click(button); page.setLanguage('en'); assert.match(page.text(content), /^My child/);
    assert.equal(control.textContent, 'Read original');
    const english = page.text(content);
    page.click(button); assert.ok(page.text(content).startsWith(expected));
    assert.equal(control.textContent, 'Read translation');
    page.click(button); assert.equal(page.text(content), english);
    page.setLanguage('id'); assert.equal(page.text(content), original);
  }

  const tansiTicket = loadPage('kotak_terbuka_page.html', 'en');
  assert.equal(tansiTicket.document.querySelector('.ticket-visual').getAttribute('src'), '../imge/tiket Bahasa Tansi.png');
  assert.equal(tansiTicket.document.querySelector('.ticket-english-overlay'), null);
  const ticketLanguage = tansiTicket.document.querySelector('#ticketDialog .btn-document-language');
  assert.equal(ticketLanguage.getAttribute('aria-pressed'), 'false');
  assert.equal(ticketLanguage.nextElementSibling.getAttribute('data-close-ticket'), '');
  tansiTicket.click(ticketLanguage);
  assert.equal(tansiTicket.document.querySelector('.ticket-english-overlay'), null);
  assert.equal(ticketLanguage.querySelector('.lang-badge-id'), null);
  assert.equal(ticketLanguage.title, 'Read original');
  assert.equal(tansiTicket.document.querySelector('.ticket-visual').dataset.language, 'id');
  assert.equal(tansiTicket.text('#btnTicketContinue'), 'Continue Exploring');
  assert.equal(tansiTicket.text('#btnTicketLogout'), 'Let’s go to Sawahlunto! →');
  assert.equal(ticketLanguage.nextElementSibling.getAttribute('aria-label'), 'Close');
  tansiTicket.click(ticketLanguage);
  tansiTicket.setLanguage('id'); tansiTicket.setLanguage('en');
  assert.equal(tansiTicket.document.querySelector('.ticket-visual').dataset.language, 'tansi');
  assert.equal(ticketLanguage.title, 'Read translation');
  assert.equal(tansiTicket.document.querySelector('.ticket-visual').getAttribute('src'), '../imge/tiket Bahasa Tansi.png');

  const settings = loadPage('surat_page.html', 'id', { guest: { nama: 'Nama Pengunjung', institusi: 'Universitas Andalas' }, signOut: async () => { throw Error('offline'); } });
  settings.click('.btn-settings'); await settings.flush();
  settings.click('#settingsLogout'); await settings.flush(); settings.setLanguage('en');
  assert.match(settings.text('#settingsFeedback'), /Could not log out/);
  assert.equal(settings.text('#settingsName'), 'Nama Pengunjung');
  assert.equal(settings.text('#settingsInstitution'), 'Universitas Andalas');
  assert.equal(settings.text('#settingsTitle'), 'Settings');

  // Both logout paths clear the same journey state only after sign-out succeeds.
  for (const path of ['settings', 'ticket']) {
    let failLogout = true;
    const session = new Map([
      ['sawahlunto_letter_opened', 'true'], ['current_visitor', JSON.stringify({ nama: 'Visitor', institusi: 'School' })]
    ]);
    const stored = new Map([
      ['sawahlunto_lang_pref', 'en'], ['cendekia_guest_identity', JSON.stringify({ nama: 'Visitor', institusi: 'School' })],
      ['sawahlunto_quest_state_v1', JSON.stringify({ completed: ['scroll'] })]
    ]);
    const page = loadPage(path === 'ticket' ? 'kotak_terbuka_page.html' : 'surat_page.html', 'en', {
      session, stored, guest: { nama: 'Visitor', institusi: 'School' },
      signOut: async () => { if (failLogout) throw Error('offline'); }
    });
    if (path === 'settings') { page.click('.btn-settings'); await page.flush(); }
    const selector = path === 'settings' ? '#settingsLogout' : '#btnTicketLogout';
    page.click(selector); await page.flush();
    assert.equal(page.window.location.href, '', path + ': failed logout must stay');
    assert.equal(session.get('sawahlunto_letter_opened'), 'true');
    assert.ok(stored.has('sawahlunto_quest_state_v1'));
    assert.match(page.text(path === 'settings' ? '#settingsFeedback' : '#toastText'), /Could not log out/);
    failLogout = false;
    page.click(selector); await page.flush();
    assert.equal(page.window.location.href, 'login_page.html');
    assert.equal(session.has('current_visitor'), false);
    assert.equal(session.has('sawahlunto_letter_opened'), false);
    assert.equal(stored.has('cendekia_guest_identity'), false);
    assert.equal(stored.has('sawahlunto_quest_state_v1'), false);
    assert.equal(stored.get('sawahlunto_lang_pref'), 'en');
    if (path === 'ticket') {
      page.window.dispatchEvent(new page.window.Event('pageshow'));
      assert.equal(page.window.location.href, 'surat_page.html', 'Back after logout must not reopen the chest');
      assert.equal(page.document.body.hidden, true);
    }
  }

  const guide = loadPage('panduan_ui.html', 'id');
  guide.submit('#guideForm'); guide.click('#guideLanguage');
  assert.equal(guide.document.documentElement.lang, 'en');
  assert.equal(guide.text('#guideNameError'), 'Please enter your full name.');
  assert.match(guide.text('#guideInstitutionError'), /Independent/);
  guide.click('#guideLoading'); assert.equal(guide.text('#guideLoading span'), 'Processing…');
  guide.setLanguage('id'); guide.setLanguage('en'); assert.equal(guide.text('#guideLoading span'), 'Processing…');
  await guide.flush(1600); assert.equal(guide.text('#guideLoading span'), 'Start demo');
  guide.click('#guideNext'); guide.setLanguage('id'); guide.setLanguage('en'); assert.equal(guide.text('#guideSlide'), 'Photo 2 of 3');
  guide.click('[data-demo]'); assert.match(guide.text('#guideToast'), /sample Enter button/);
  guide.setLanguage('id'); assert.match(guide.text('#guideToast'), /Contoh tombol/);
  guide.setLanguage('en'); assert.match(guide.text('#guideToast'), /sample Enter button/);
  guide.document.querySelector('#guideName').value = 'Visitor'; guide.document.querySelector('#guideInstitution').value = 'Independent';
  guide.submit('#guideForm'); assert.match(guide.text('#guideToast'), /No data was sent or saved/);
  console.log('PASS: all pages load in English; repeated ID/EN switching, guestbook validation/saving/errors, letter and chest navigation, all relics, selected photos, lightbox, map, lantern, ticket, settings errors, and guide interactions.');
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { loadPage };
