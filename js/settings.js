document.addEventListener('DOMContentLoaded', () => {
  const toolbar = document.querySelector('.lang-switch-top-right');
  if (!toolbar) return;
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'btn-settings';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'settingsDialog');
  trigger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9.5 3-.6 2.3-2 .9-2.1-.6-2.5 4.3 1.6 1.7v2.3l-1.6 1.7L4.8 20l2.1-.6 2 .9.6 2.2h5l.6-2.2 2-.9 2.1.6 2.5-4.4-1.6-1.7v-2.3l1.6-1.7-2.5-4.3-2.1.6-2-.9L14.5 3z"/><circle cx="12" cy="12.7" r="3.2"/></svg>';
  toolbar.append(trigger);
  const dialog = document.createElement('dialog');
  dialog.id = 'settingsDialog';
  dialog.className = 'settings-dialog';
  dialog.setAttribute('aria-labelledby', 'settingsTitle');
  dialog.innerHTML = `
    <header class="settings-header"><div><span class="settings-eyebrow" data-setting-text="story"></span><h2 id="settingsTitle" data-setting-text="title"></h2></div><button type="button" class="settings-close" data-settings-close>×</button></header>
    <div class="settings-content">
      <section><p class="settings-section-label" data-setting-text="sound"></p>
        <div class="settings-volume-heading"><label for="settingsVolume" data-setting-text="volume"></label><output for="settingsVolume" id="settingsVolumeValue"></output></div>
        <p class="settings-description" data-setting-text="atmosphere"></p>
        <div class="settings-volume-controls"><button type="button" class="settings-step" id="settingsVolumeDown">−</button><input type="range" id="settingsVolume" min="0" max="100" step="1"><button type="button" class="settings-step" id="settingsVolumeUp">+</button></div>
        <div class="settings-range-labels"><span data-setting-text="silent"></span><span data-setting-text="maximum"></span></div>
      </section>
      <section class="settings-account-section"><p class="settings-section-label" data-setting-text="account"></p>
        <div class="settings-account"><div class="settings-avatar" id="settingsAvatar" aria-hidden="true">—</div><div class="settings-profile"><div class="settings-profile-row"><div><div class="settings-field-label" data-setting-text="name"></div><p class="settings-name" id="settingsName">—</p></div><span class="settings-status" id="settingsStatus" role="status"></span></div><div class="settings-institution-row"><span class="settings-field-label" data-setting-text="institution"></span><span class="settings-institution" id="settingsInstitution">—</span></div></div></div>
        <button type="button" class="settings-logout" id="settingsLogout" data-setting-text="logout"></button><p class="settings-logout-note" data-setting-text="logoutNote"></p><p class="settings-feedback" role="status" id="settingsFeedback"></p>
      </section>
    </div><footer class="settings-footer"><span data-setting-text="footer"></span><button type="button" class="settings-done" data-settings-close data-setting-text="done"></button></footer>`;
  document.body.append(dialog);
  const find = selector => dialog.querySelector(selector);
  const volume = find('#settingsVolume');
  const logout = find('#settingsLogout');
  let guest = null;
  let checking = false;
  let busy = false;
  let requestId = 0;
  const copy = {
    id: { title:'Pengaturan',sound:'Suara latar',volume:'Volume backsound',atmosphere:'Atur suasana selama menjelajah.',silent:'Senyap',maximum:'Maksimal',account:'Informasi login akun',name:'Nama pengunjung',institution:'Asal sekolah / institusi',logout:'Logout',logoutNote:'Kembali ke buku tamu untuk masuk dengan akun lain.',footer:'Atur volume, lalu lanjutkan penjelajahan.',done:'Selesai',signedIn:'Sudah masuk',signedOut:'Belum masuk',checking:'Memeriksa…',close:'Tutup pengaturan',down:'Kurangi volume',up:'Tambah volume',error:'Logout belum berhasil. Periksa koneksi dan coba lagi.',unknown:'Tidak dapat memeriksa sesi',leaving:'Keluar…' },
    en: { title:'Settings',sound:'Background audio',volume:'Background music volume',atmosphere:'Set the mood while you explore.',silent:'Silent',maximum:'Maximum',account:'Account information',name:'Visitor name',institution:'School / institution',logout:'Log out',logoutNote:'Return to the guestbook to sign in as another visitor.',footer:'Adjust the volume, then continue exploring.',done:'Done',signedIn:'Signed in',signedOut:'Signed out',checking:'Checking…',close:'Close settings',down:'Lower volume',up:'Raise volume',error:'Could not log out. Check your connection and try again.',unknown:'Unable to check session',leaving:'Logging out…' }
  };
  let sessionError = false;
  let logoutError = false;
  const texts = () => copy[window.SawahluntoLanguage?.() || document.documentElement.lang] || copy.id;
  function render() {
    const text = texts();
    text.story = window.SawahluntoLanguage?.() === 'en' ? "PAK ITAM’S LETTER" : 'SURAT PAK ITAM';
    dialog.querySelectorAll('[data-setting-text]').forEach(node => { node.textContent = text[node.dataset.settingText]; });
    trigger.title = text.title;
    trigger.setAttribute('aria-label', text.title);
    find('.settings-close').setAttribute('aria-label', text.close);
    find('#settingsVolumeDown').setAttribute('aria-label', text.down);
    find('#settingsVolumeUp').setAttribute('aria-label', text.up);
    find('#settingsName').textContent = guest?.nama || '—';
    find('#settingsInstitution').textContent = guest?.institusi || '—';
    find('#settingsAvatar').textContent = guest?.nama ? Array.from(guest.nama.trim()).slice(0,2).join('') : '—';
    const status = find('#settingsStatus');
    status.textContent = checking ? text.checking : sessionError ? text.unknown : guest ? text.signedIn : text.signedOut;
    status.dataset.loggedIn = String(!!guest && !sessionError);
    logout.disabled = busy || checking || (!guest && !sessionError);
    if (busy) logout.textContent = text.leaving;
    find('#settingsFeedback').textContent = logoutError ? text.error : '';
  }
  function setVolume(value) {
    window.SawahluntoAudio?.setVolume(value);
    volume.value = String(window.SawahluntoAudio?.getVolume() ?? 35);
    find('#settingsVolumeValue').textContent = volume.value + '%';
    volume.setAttribute('aria-valuetext', volume.value + '%');
  }
  async function refreshGuest() {
    const id = ++requestId;
    checking = true; guest = null; sessionError = false; render();
    try {
      const profile = await window.sawahFirebase.getGuest();
      if (id === requestId) guest = profile;
    } catch { if (id === requestId) sessionError = true; }
    finally { if (id === requestId) { checking = false; render(); } }
  }
  trigger.addEventListener('click', () => {
    if (!dialog.open) dialog.showModal();
    setVolume(window.SawahluntoAudio?.getVolume() ?? 35);
    refreshGuest();
  });
  volume.addEventListener('input', () => setVolume(volume.value));
  find('#settingsVolumeDown').addEventListener('click', () => setVolume(Number(volume.value) - 10));
  find('#settingsVolumeUp').addEventListener('click', () => setVolume(Number(volume.value) + 10));
  dialog.querySelectorAll('[data-settings-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => { requestId++; checking = false; trigger.focus(); });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  logout.addEventListener('click', async () => {
    if (busy) return;
    busy = true; requestId++; logoutError = false; render();
    try {
      await window.sawahFirebase.signOut();
      sessionStorage.removeItem('current_visitor');
      sessionStorage.removeItem('sawahlunto_letter_opened');
      localStorage.removeItem('cendekia_guest_identity');
      localStorage.removeItem('sawahlunto_quest_state_v1');
      if (window.SawahluntoAudio?.navigate) await window.SawahluntoAudio.navigate('login_page.html');
      else window.location.href = 'login_page.html';
    } catch { logoutError = true; }
    finally { busy = false; render(); }
  });
  document.addEventListener('sawahlunto:language', render);
  render();
});
