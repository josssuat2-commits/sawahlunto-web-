document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.matches('.page-surat, .page-surat-terbuka, .page-kotak')) return;
  const data = window.SawahluntoCreditsData;
  if (!data) return;
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'credits-trigger';
  trigger.textContent = 'i';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'creditsDialog');
  const dialog = document.createElement('dialog');
  dialog.id = 'creditsDialog';
  dialog.className = 'credits-dialog';
  dialog.setAttribute('aria-labelledby', 'creditsTitle');
  dialog.innerHTML = `<header class="credits-header"><div><p class="credits-eyebrow"></p><h2 id="creditsTitle"></h2><p class="credits-intro"></p></div><button type="button" class="credits-close" data-credits-close>×</button></header><div class="credits-body" tabindex="0"></div><footer class="credits-footer"><p class="credits-status"></p><button type="button" data-credits-close class="credits-done"></button></footer>`;
  document.body.append(trigger, dialog);
  let previousOverflow = '';
  const hasPopup = () => !!document.querySelector('dialog[open], .inspection-modal-overlay.active');
  function syncTrigger() { trigger.hidden = hasPopup(); }
  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function render() {
    const en = window.SawahluntoLanguage?.() === 'en';
    const index = en ? 1 : 0;
    const t = (id, english) => en ? english : id;
    const title = t('Kredit & Sumber Rujukan', 'Credits & References');
    trigger.title = title;
    trigger.setAttribute('aria-label', title);
    dialog.querySelector('#creditsTitle').textContent = title;
    dialog.querySelector('.credits-eyebrow').textContent = t('Surat Pak Itam yang Belum Selesai', 'Pak Itam’s Unfinished Letter');
    dialog.querySelector('.credits-intro').textContent = t('Catatan konten, aset visual, audio, dan tipografi dalam penjelajahan Sawahlunto.', 'An inventory of the content, visual assets, audio and typography in this Sawahlunto experience.');
    dialog.querySelector('.credits-close').setAttribute('aria-label', t('Tutup kredit', 'Close credits'));
    dialog.querySelector('.credits-done').textContent = t('Tutup Jendela', 'Close Window');
    dialog.querySelector('.credits-status').textContent = t('Daftar sumber sedang dilengkapi.', 'Source details are being compiled.');
    const body = dialog.querySelector('.credits-body');
    const scroll = body.scrollTop;
    body.replaceChildren();
    const note = element('div', 'credits-note');
    note.append(element('h3', '', t('Tentang aset yang digunakan', 'About the assets')),
      element('p', '', t('Seluruh aset visual, musik latar, dan efek suara dalam proyek ini diperoleh dari internet, bukan karya sendiri. Hak atas setiap aset tetap pada pemiliknya.', 'All visual assets, background music and sound effects in this project were obtained from the internet and are not original creations. Each asset remains the property of its respective owner.')),
      element('p', '', t('Untuk sementara, daftar ini memuat judul konten dan nama file aset. Nama pencipta, tautan sumber, serta informasi lisensi akan dilengkapi berdasarkan tabel aset yang sedang disusun.', 'For now, this inventory lists content titles and asset filenames. Creator names, source links and license information will be added from the asset register currently being compiled.')));
    body.append(note);
    function section(title) {
      const section = element('section', 'credits-section');
      section.append(element('h3', 'credits-section-title', title));
      body.append(section);
      return section;
    }
    const content = section(t('01 / Konten & Rujukan', '01 / Content & References'));
    content.append(element('p', 'credits-section-note', t('Judul materi pada setiap benda; rincian rujukan menyusul.', 'Material titles for each object; reference details will follow.')));
    const grid = element('div', 'credits-grid');
    for (const group of data.content) {
      const card = element('article', 'credits-card');
      card.append(element('h4', '', group.title[index]));
      const list = element('ul', 'credits-titles');
      for (const item of group.items) list.append(element('li', '', item[index]));
      card.append(list);
      grid.append(card);
    }
    content.append(grid);
    const visual = section(t('02 / Aset Visual', '02 / Visual Assets'));
    visual.append(element('p', 'credits-section-note', t('Latar, kertas surat, peti, benda, foto, gambar terkunci, dan tiket dalam inventaris proyek.', 'Backgrounds, letter paper, chests, objects, photographs, locked artwork and tickets in the project inventory.')));
    const files = element('ul', 'credits-files');
    for (const file of data.images) files.append(element('li', '', file));
    visual.append(files);
    const audio = section(t('03 / Musik Latar & Efek Suara', '03 / Background Music & Sound Effects'));
    const audioGrid = element('div', 'credits-grid');
    for (const [title, items] of [[t('Musik latar', 'Background music'), data.music], [t('Efek suara tombol', 'Button sound effects'), data.sounds]]) {
      const card = element('article', 'credits-card');
      card.append(element('h4', '', title));
      const list = element('ul', 'credits-file-list');
      for (const file of items) list.append(element('li', '', file));
      card.append(list);
      audioGrid.append(card);
    }
    audio.append(audioGrid);
    const typography = section(t('04 / Tipografi & Peta Digital', '04 / Typography & Digital Maps'));
    typography.append(element('p', '', data.fonts.join(' · ')), element('p', '', 'Google Fonts · Google Maps'));
    body.scrollTop = scroll;
  }
  trigger.addEventListener('click', () => {
    if (hasPopup()) return;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    syncTrigger();
  });
  dialog.querySelectorAll('[data-credits-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    syncTrigger();
    if (!trigger.hidden) trigger.focus();
  });
  new MutationObserver(syncTrigger).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'open'] });
  document.addEventListener('sawahlunto:language', render);
  window.addEventListener('pageshow', syncTrigger);
  render();
  syncTrigger();
});
