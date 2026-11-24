/**
Sawah Lunto Heritage Interactive Script
Skrip Terpadu untuk Halaman Login, Surat Warkah, dan Kotak Terbuka
*/
document.addEventListener('DOMContentLoaded', () => {
  function navigateWithMusic(url) {
    if (window.SawahluntoAudio?.navigate) return window.SawahluntoAudio.navigate(url);
    window.location.href = url;
  }
  // Kunci Penyimpanan
  const STORAGE_KEY = 'cendekia_guest_identity';
  const SESSION_KEY = 'current_visitor';
  const LETTER_OPENED_KEY = 'sawahlunto_letter_opened';

  function guardChestAccess() {
    if (document.body.classList.contains('page-kotak') && sessionStorage.getItem(LETTER_OPENED_KEY) !== 'true') {
      document.body.hidden = true;
      window.location.replace('surat_page.html');
      return false;
    }
    return true;
  }
  window.addEventListener('pageshow', () => {
    if (guardChestAccess()) renderRoomChest();
  });
  if (!guardChestAccess()) return;

  if (document.body.classList.contains('page-surat-terbuka')) {
    sessionStorage.setItem(LETTER_OPENED_KEY, 'true');
  }

  // Suara diputar setelah interaksi pengguna, termasuk klik pada ikon di tombol.
  const clickSounds = {
    button: new Audio('../sound/button_sound.mp3'),
    letter: new Audio('../sound/button_sound_surat_terbuka.mp3'),
    chest: new Audio('../sound/button_sound_kotak_terbuka.mp3')
  };
  Object.values(clickSounds).forEach(sound => { sound.preload = 'auto'; });

  function playClickSound(type = 'button') {
    const sound = clickSounds[type].cloneNode();
    return new Promise(resolve => {
      // Navigasi tetap berjalan bila audio gagal dimuat atau browser menolak playback.
      const timeout = setTimeout(finish, 1800);
      function finish() {
        clearTimeout(timeout);
        sound.pause();
        resolve();
      }
      sound.addEventListener('ended', finish, { once: true });
      sound.addEventListener('error', finish, { once: true });
      sound.play().catch(finish);
    });
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    // Kontrol galeri baru memutar suaranya sendiri; tombol penyelesaian memakai alur utama.
    if (event.target.closest('.prototype-gallery button') && !event.target.closest('[data-quest-complete]')) return;
    // Pembukaan benda ditangani langsung oleh fungsi terkait agar tidak berbunyi dua kali.
    if (event.target.closest('#sealHitbox, #envelopeCard, #chestContainer, .inventory-item, #btnOpenAllItems')) return;
    const control = event.target.closest('button, a[href], input[type="submit"], input[type="button"], [role="button"], .album-dots-indicator .dot, .lantern-dots-indicator .dot');
    if (!control || control.matches(':disabled, [aria-disabled="true"]')) return;
    const playback = playClickSound(control.matches('.btn-open-chest') ? 'chest' : 'button');
    // Tunggu suara pada tautan lokal agar tidak terpotong oleh pergantian halaman.
    if (control.matches('a[href]') && !event.defaultPrevented && event.button === 0 &&
        !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey &&
        !control.hasAttribute('download') && (!control.target || control.target === '_self')) {
      const destination = new URL(control.href, window.location.href);
      if (destination.origin === window.location.origin && destination.pathname !== window.location.pathname) {
        event.preventDefault();
        playback.then(() => navigateWithMusic(destination.href));
      }
    }
  }, true);

  function getActiveVisitor() {
    try {
      const rawSession = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(STORAGE_KEY);
      if (rawSession) {
        return JSON.parse(rawSession);
      }
    } catch (e) {
      console.warn('Gagal membaca sesi pengunjung:', e);
    }
    return null;
  }

  // =========================================================================
  // 1. UTILITAS BERSAMA & SINKRONISASI DATABASE (TOAST & DB STATUS)
  // =========================================================================
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  let toastMessage = null;
  let toastTimer;

  function showToast(message, isError = false) {
    if (!toast || !toastText) return;
    toastMessage = typeof message === 'function' ? message : () => message;
    toastText.textContent = toastMessage();
    toast.style.borderLeftColor = isError ? '#c44536' : '#b3864c';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      toastMessage = null;
    }, 3200);
  }

  // =========================================================================
  // SISTEM INTERNASIONALISASI (i18n): INDONESIA <-> ENGLISH
  // =========================================================================
  const LANG_STORAGE_KEY = 'sawahlunto_lang_pref';
  let currentLang = localStorage.getItem(LANG_STORAGE_KEY) === 'en' ? 'en' : 'id';

  const I18N_DICT = {
    id: {
      btn_reset_quest: "Ulangi dari Awal",
      login_category: "Buku Tamu",
      login_title: "Surat Pak Itam yang Belum Selesai",
      login_subtitle: "Silakan daftarkan nama dan asal institusi.",
      login_name_label: "Nama Lengkap",
      login_name_hint: "Gelar/Panggilan Diterima",
      login_name_placeholder: "Contoh: Raden Satria / Anastasia Lestari",
      login_inst_label: "Asal Sekolah / Lembaga Riset",
      login_inst_hint: "Institusi atau Mandiri",
      login_inst_placeholder: "Contoh: SMA Negeri 1 Yogyakarta / Universitas Indonesia",
      login_remember: "Simpan",
      login_nopass: "Akses Tanpa Sandi",
      login_submit: "Masuk",
      login_saving: "Menyimpan ke Database...",
      login_notice: "Tidak memerlukan kata sandi. Pintu perpustakaan terbuka lebar untuk setiap pencari ilmu.",
      surat_back_title: "Kembali ke Buku Tamu",
      surat_back_btn: "Buku Tamu",
      visitor: "Pengunjung:",
      chest_title: "Peti",
      chest_tooltip: "Peti (Klik untuk Buka)",
      chest_locked: "Peti (Buka surat terlebih dahulu)",
      envelope_seal_title: "Buka segel surat",
      envelope_subtext: "Ketuk amplop atau segel untuk membaca surat dari Ayah",
      letter_close_title: "Kembali ke Ruangan",
      letter_close_btn: "Tutup Surat",
      btn_open_chest: "Buka Peti",
      kotak_back_title: "Kembali ke Ruangan Surat",
      kotak_back_btn: "Kembali ke Ruangan",
      btn_open_all: "Buka Benda",
      subtext_start: "Ketuk surat dari Ayah untuk memulai penyelidikan",
      btn_close: "Tutup",
      scroll_unlock_btn: "Lanjut Jelajah",
      ticket_author_label: "TERTANDA & DICAP:",
      album_kicker: "BILIK INSPEKSI RELIKUI",
      album_modal_title: "Album Foto Sepia & Dokumentasi",
      album_cat: "ALBUM KULIT BERORNAMEN KUNINGAN",
      album_heading: "Dokumentasi Perak Albumen Ombilin",
      btn_prev: "← Sebelumnya",
      btn_next: "Selanjutnya →",
      spec_technique: "Teknik Fotografi:",
      spec_collection: "Koleksi:",
      spec_status: "Status Pelestarian:",
      btn_close_album: "Tutup Album Foto",
      btn_unlock_map: "Jelajahi Peta →",
      lantern_kicker: "BILIK INSPEKSI RELIKUI SAWAHLUNTO",
      lantern_modal_title: "Lentera Keselamatan & Sejarah Sawahlunto",
      lantern_cat: "CAHAYA SEJARAH KOTA SAWAHLUNTO",
      lantern_heading: "Dokumentasi Perjalanan Kota Tambang",
      btn_close_lantern: "Tutup Lentera",
      btn_unlock_ticket: "LANJUT JELAJAH →",
      map_kicker: "DESTINASI PARIWISATA SAWAHLUNTO",
      map_modal_title: "Peta & Panduan Tempat Wisata",
      map_cat: "EKSPLORASI TEMPAT WISATA BERSEJARAH & ALAM",
      map_heading: "Panduan Destinasi Pariwisata Sawahlunto",
      map_photo_1: "Foto 1",
      map_photo_2: "Foto 2",
      spec_hours: "Jam Operasional:",
      spec_closed: "Hari Perawatan:",
      spec_nav: "Navigasi Peta:",
      spec_nav_link: "Petunjuk Google Maps ↗",
      spec_dest_status: "Status Destinasi:",
      spec_dest_active: "Aktif & Terbuka Untuk Umum",
      btn_close_map: "Tutup Peta",
      btn_unlock_lantern: "Lanjut Jelajah →"
    },
    en: {
      btn_reset_quest: "Start Over",
      login_category: "Guestbook",
      login_title: "Pak Itam's Unfinished Letter",
      login_subtitle: "Please register your name and institution.",
      login_name_label: "Full Name",
      login_name_hint: "Titles/Honorifics Accepted",
      login_name_placeholder: "e.g.: Raden Satria / Anastasia Lestari",
      login_inst_label: "School / Research Institution",
      login_inst_hint: "Institution or Independent",
      login_inst_placeholder: "e.g.: SMA 1 Yogyakarta / University of Indonesia",
      login_remember: "Save",
      login_nopass: "Passwordless Access",
      login_submit: "Enter",
      login_saving: "Saving to Database...",
      login_notice: "No password required. The library doors are wide open for every seeker of knowledge.",
      surat_back_title: "Back to Guestbook",
      surat_back_btn: "Guestbook",
      visitor: "Visitor:",
      chest_title: "Chest",
      chest_tooltip: "Chest (Click to Open)",
      chest_locked: "Chest (Open the letter first)",
      envelope_seal_title: "Break letter seal",
      envelope_subtext: "Tap the envelope or seal to read the letter from Father",
      letter_close_title: "Return to the Letter Room",
      letter_close_btn: "Close Letter",
      btn_open_chest: "Open Chest",
      kotak_back_title: "Return to Letter Room",
      kotak_back_btn: "Back to the Room",
      btn_open_all: "Inspect Item",
      subtext_start: "Tap the letter from Father to begin the investigation",
      btn_close: "Close",
      scroll_unlock_btn: "Continue Exploring",
      ticket_author_label: "SIGNED & SEALED:",
      album_kicker: "RELIC INSPECTION CHAMBER",
      album_modal_title: "Sepia Photo Album & Documentation",
      album_cat: "BRASS-ORNAMENTED LEATHER ALBUM",
      album_heading: "Ombilin Albumen Silver Documentation",
      btn_prev: "← Previous",
      btn_next: "Next →",
      spec_technique: "Photography Technique:",
      spec_collection: "Collection:",
      spec_status: "Preservation Status:",
      btn_close_album: "Close Photo Album",
      btn_unlock_map: "Explore the Map →",
      lantern_kicker: "SAWAHLUNTO RELIC INSPECTION CHAMBER",
      lantern_modal_title: "Safety Lantern & Sawahlunto History",
      lantern_cat: "LIGHT OF SAWAHLUNTO CITY'S HISTORY",
      lantern_heading: "Chronicles of the Mining City",
      btn_close_lantern: "Close Lantern",
      btn_unlock_ticket: "CONTINUE EXPLORING →",
      map_kicker: "SAWAHLUNTO TOURISM DESTINATIONS",
      map_modal_title: "Map & Guide to Tourism Spots",
      map_cat: "HISTORICAL & NATURE ATTRACTIONS EXPLORATION",
      map_heading: "Sawahlunto Tourism Destination Guide",
      map_photo_1: "Photo 1",
      map_photo_2: "Photo 2",
      spec_hours: "Opening Hours:",
      spec_closed: "Maintenance Day:",
      spec_nav: "Map Navigation:",
      spec_nav_link: "Google Maps Directions ↗",
      spec_dest_status: "Destination Status:",
      spec_dest_active: "Active & Open to the Public",
      btn_close_map: "Close Map",
      btn_unlock_lantern: "Continue Exploring →"
    }
  };

  function applyTranslations(lang) {
    lang = lang === 'en' ? 'en' : 'id';
    currentLang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    // 1. Update text elements dengan data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (I18N_DICT[lang] && I18N_DICT[lang][key]) {
        el.textContent = I18N_DICT[lang][key];
      }
    });

    // 2. Update placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (I18N_DICT[lang] && I18N_DICT[lang][key]) {
        el.placeholder = I18N_DICT[lang][key];
      }
    });

    // 3. Update title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (I18N_DICT[lang] && I18N_DICT[lang][key]) {
        el.title = I18N_DICT[lang][key];
      }
    });

    // 4. Update status visual tombol badge (ID / EN)
    const badgeId = document.querySelector('.lang-badge-id');
    const badgeEn = document.querySelector('.lang-badge-en');
    if (badgeId && badgeEn) {
      if (lang === 'en') {
        badgeId.classList.remove('active');
        badgeEn.classList.add('active');
      } else {
        badgeEn.classList.remove('active');
        badgeId.classList.add('active');
      }
    }

    // 5. Perbarui tampilan visual dinamis jika berada di kotak_terbuka_page.html
    if (typeof updateChestVisuals === 'function') {
      updateChestVisuals();
    }
    if (typeof albumInspectionModal !== 'undefined' && albumInspectionModal && albumInspectionModal.classList.contains('active') && typeof renderAlbumSlide === 'function') {
      renderAlbumSlide(currentPhotoIndex);
    }
    if (typeof mapInspectionModal !== 'undefined' && mapInspectionModal && mapInspectionModal.classList.contains('active') && typeof renderMapDestination === 'function') {
      renderMapDestination(currentMapDestIndex, currentMapPhotoSubIndex);
    }
    if (typeof lanternInspectionModal !== 'undefined' && lanternInspectionModal && lanternInspectionModal.classList.contains('active') && typeof renderLanternSlide === 'function') {
      renderLanternSlide(currentLanternIndex);
    }
    if (currentlyInspectingKey && inspectionModal?.classList.contains('active')) {
      openInspectionModal(currentlyInspectingKey);
    }
    const submit = document.getElementById('submitBtn');
    if (submit?.disabled) submit.querySelector('.btn-text').textContent = lang === 'en' ? 'Saving…' : 'Menyimpan…';
    renderDatabaseStatus();
    renderRoomChest();
    if (toastMessage && toastText) toastText.textContent = toastMessage();
    document.dispatchEvent(new CustomEvent('sawahlunto:language', { detail: lang }));
  }

  function toggleLanguage() {
    const nextLang = (currentLang === 'id') ? 'en' : 'id';
    applyTranslations(nextLang);
    const toastMsg = () => (currentLang === 'en')
      ? 'Language switched to English (ENG)'
      : 'Bahasa diubah ke Bahasa Indonesia (ID)';
    showToast(toastMsg);
  }

  const btnToggleLanguage = document.getElementById('btnToggleLanguage');
  if (btnToggleLanguage) {
    btnToggleLanguage.addEventListener('click', toggleLanguage);
  }

  // Elemen Lencana Pengunjung & Status Database
  const visitorBadge = document.getElementById('visitorBadge');
  const visitorName = document.getElementById('visitorName');
  const visitorInstitusi = document.getElementById('visitorInstitusi');
  const dbStatusBadge = document.getElementById('dbStatusBadge');
  const dbStatusText = document.getElementById('dbStatusText');
  const dbGuestCount = document.getElementById('dbGuestCount');
  const archiveCode = document.getElementById('archiveCode');
  const archiveTitle = document.getElementById('archiveTitle');
  const archiveSealStatus = document.getElementById('archiveSealStatus');

  function renderDatabaseStatus() {
    if (!dbStatusBadge || !dbStatusText) return;
    const online = dbStatusBadge.classList.contains('db-online');
    const offline = dbStatusBadge.classList.contains('db-offline');
    const en = currentLang === 'en';
    dbStatusText.textContent = online
      ? (en ? 'Firebase connected' : 'Firebase terhubung')
      : offline ? (en ? 'Firebase disconnected' : 'Firebase tidak terhubung')
      : (en ? 'Connecting…' : 'Menghubungkan…');
    dbStatusBadge.title = online
      ? (en ? 'Your visitor profile is synced with Firestore' : 'Profil pengunjung tersinkronisasi dengan Firestore')
      : (en ? 'Check your internet connection and Firebase configuration.' : 'Periksa koneksi internet dan konfigurasi Firebase.');
  }

  // Muat identitas awal dari sesi lokal sebagai fallback cepat
  const initialVisitor = getActiveVisitor();
  if (visitorBadge && visitorName && initialVisitor && initialVisitor.nama) {
    visitorName.textContent = initialVisitor.nama;
    if (visitorInstitusi && initialVisitor.institusi) {
      visitorInstitusi.textContent = initialVisitor.institusi;
      visitorInstitusi.style.display = 'inline-block';
    }
    visitorBadge.style.display = 'inline-flex';
  }

  // Read only the profile owned by the current Firebase session.
  async function syncDatabaseState() {
    if (dbGuestCount) dbGuestCount.style.display = 'none';
    try {
      const guest = await window.sawahFirebase.getGuest();
      if (!guest) return;
      if (visitorBadge && visitorName) {
        visitorName.textContent = guest.nama;
        if (visitorInstitusi) {
          visitorInstitusi.textContent = guest.institusi;
          visitorInstitusi.style.display = 'inline-block';
        }
        visitorBadge.style.display = 'inline-flex';
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        uid: guest.uid, nama: guest.nama, institusi: guest.institusi,
        waktuMasuk: guest.updatedAt?.toDate?.().toISOString() || new Date().toISOString()
      }));
      if (dbStatusBadge && dbStatusText) {
        dbStatusBadge.classList.remove('db-connecting', 'db-offline');
        dbStatusBadge.classList.add('db-online');
        renderDatabaseStatus();
      }
    } catch (error) {
      console.warn('Gagal membaca profil Firebase:', error.code || error.message);
      if (dbStatusBadge && dbStatusText) {
        dbStatusBadge.classList.remove('db-connecting', 'db-online');
        dbStatusBadge.classList.add('db-offline');
        renderDatabaseStatus();
      }
    }
  }
  if (!document.getElementById('loginForm')) syncDatabaseState();

  // =========================================================================
  // 2. LOGIKA HALAMAN LOGIN (BUKU TAMU)
  // =========================================================================
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const inputNama = document.getElementById('namaLengkap');
    const inputInstitusi = document.getElementById('institusi');
    const rememberCheckbox = document.getElementById('rememberMe');
    const submitButton = document.getElementById('submitBtn');
    const btnText = submitButton ? submitButton.querySelector('.btn-text') : null;
    const btnSpinner = submitButton ? submitButton.querySelector('.spinner') : null;

    // Muat data lokal yang tersimpan
    const savedIdentity = localStorage.getItem(STORAGE_KEY);
    if (savedIdentity) {
      try {
        const data = JSON.parse(savedIdentity);
        if (data.nama && inputNama) inputNama.value = data.nama;
        if (data.institusi && inputInstitusi) inputInstitusi.value = data.institusi;
        if (rememberCheckbox) rememberCheckbox.checked = true;
      } catch (e) {
        console.warn('Gagal memuat identitas lokal:', e);
      }
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nama = inputNama ? inputNama.value.trim() : '';
      const institusi = inputInstitusi ? inputInstitusi.value.trim() : '';

      if (!nama) {
        showToast(() => currentLang === 'en' ? 'Please enter your full name.' : 'Harap masukkan nama lengkap Anda.', true);
        if (inputNama) inputNama.focus();
        return;
      }

      if (!institusi) {
        showToast(() => currentLang === 'en' ? 'Please enter your school or institution.' : 'Harap masukkan asal sekolah atau lembaga riset.', true);
        if (inputInstitusi) inputInstitusi.focus();
        return;
      }

      if (submitButton?.disabled) return;
      if (nama.length > 255 || institusi.length > 255) {
        showToast(() => currentLang === 'en' ? 'Your name and institution must each be 255 characters or fewer.' : 'Nama dan institusi maksimal 255 karakter.', true);
        return;
      }
      if (navigator.onLine === false) {
        showToast(() => currentLang === 'en' ? 'An internet connection is required to save your guestbook entry.' : 'Koneksi internet diperlukan untuk menyimpan buku tamu.', true);
        return;
      }
      if (submitButton) submitButton.disabled = true;
      if (btnText) btnText.textContent = currentLang === 'en' ? 'Saving…' : 'Menyimpan…';
      if (btnSpinner) btnSpinner.style.display = 'inline-block';
      let saved = false;
      try {
        const result = await window.sawahFirebase.saveGuest({
          nama, institusi, remember: !!rememberCheckbox?.checked
        });
        // Local identity is a display preference, never a Firebase credential.
        if (rememberCheckbox?.checked) localStorage.setItem(STORAGE_KEY, JSON.stringify({ nama, institusi }));
        else localStorage.removeItem(STORAGE_KEY);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
          uid: result.uid, nama, institusi, waktuMasuk: new Date().toISOString()
        }));
        // Each successful guestbook login starts a new investigation.
        sessionStorage.removeItem(LETTER_OPENED_KEY);
        localStorage.removeItem('sawahlunto_quest_state_v1');
        saved = true;
        showToast(() => currentLang === 'en' ? `Welcome, ${nama}. The letter room awaits.` : 'Selamat datang, ' + nama + '. Pintu naskah dibuka.');
        setTimeout(() => navigateWithMusic('surat_page.html'), 850);
      } catch (error) {
        console.warn('Buku tamu Firebase:', error.code || error.message);
        showToast(() => currentLang === 'en' ? 'We could not save your entry. Check your connection and try again.' : 'Data belum berhasil disimpan. Periksa koneksi dan coba lagi.', true);
      } finally {
        if (!saved) {
          if (submitButton) submitButton.disabled = false;
          if (btnText) btnText.textContent = currentLang === 'en' ? 'Enter' : 'Masuk';
          if (btnSpinner) btnSpinner.style.display = 'none';
        }
      }
    });
  }

  // =========================================================================
  // 3. LOGIKA HALAMAN SURAT WARKAH (surat_page.html)
  // =========================================================================
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const sealHitbox = document.getElementById('sealHitbox');
  const envelopeCard = document.getElementById('envelopeCard');
  const chestContainer = document.getElementById('chestContainer');
  function renderRoomChest() {
    if (!chestContainer) return;
    const locked = sessionStorage.getItem(LETTER_OPENED_KEY) !== 'true';
    const label = I18N_DICT[currentLang][locked ? 'chest_locked' : 'chest_tooltip'];
    chestContainer.setAttribute('aria-disabled', String(locked));
    chestContainer.setAttribute('aria-label', label);
    chestContainer.title = label;
    const tooltip = chestContainer.querySelector('.chest-tooltip');
    if (tooltip) {
      tooltip.setAttribute('data-i18n', locked ? 'chest_locked' : 'chest_tooltip');
      tooltip.textContent = label;
    }
  }
  const chestModal = document.getElementById('chestModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  let isOpeningLetter = false;

  function handleOpenLetter() {
    if (isOpeningLetter) return;
    isOpeningLetter = true;
    const playback = playClickSound('letter');


    if (envelopeWrapper) {
      envelopeWrapper.classList.add('opening-transition');
    }

    showToast(() => currentLang === 'en' ? 'The seal is broken. Opening the letter…' : 'Segel warkah dibuka. Menampilkan isi naskah...');

    Promise.all([playback, new Promise(resolve => setTimeout(resolve, 650))]).then(() => {
      navigateWithMusic('surat_terbuka.html');
    });
  }

  if (sealHitbox) {
    sealHitbox.addEventListener('click', (e) => {
      e.stopPropagation();
      handleOpenLetter();
    });
  }

  if (envelopeCard) {
    envelopeCard.addEventListener('click', handleOpenLetter);
  }

  // Interaksi Peti di surat_page.html
  let isOpeningChest = false;
  if (chestContainer) {
    chestContainer.addEventListener('click', () => {
      if (isOpeningChest) return;
      if (sessionStorage.getItem(LETTER_OPENED_KEY) !== 'true') {
        showToast(() => currentLang === 'en'
          ? 'Open the letter first before opening the chest.'
          : 'Buka surat terlebih dahulu sebelum membuka peti.', true);
        return;
      }
      const playback = playClickSound('chest');
      if (chestModal) {
        chestModal.classList.add('active');
      } else {
        isOpeningChest = true;
        // Navigasi ke peti terbuka
        showToast(() => currentLang === 'en' ? 'Opening the chest…' : 'Membuka peti...');
        Promise.all([playback, new Promise(resolve => setTimeout(resolve, 350))]).then(() => {
          navigateWithMusic('kotak_terbuka_page.html');
        });
      }
    });

    if (btnCloseModal && chestModal) {
      btnCloseModal.addEventListener('click', () => {
        chestModal.classList.remove('active');
      });
    }

    if (chestModal) {
      chestModal.addEventListener('click', (e) => {
        if (e.target === chestModal) {
          chestModal.classList.remove('active');
        }
      });
    }
  }
  // =========================================================================
  // 4. LOGIKA SISTEM UNLOCK BERTAHAP DI KOTAK TERBUKA (kotak_terbuka_page.html)
  //    Urutan: 1. Surat -> 2. Album -> 3. Peta -> 4. Lentera -> 5. Tiket
  // =========================================================================
  const QUEST_STORAGE_KEY = 'sawahlunto_quest_state_v1';
  const UNLOCK_SEQUENCE = ['scroll', 'album', 'map', 'lantern', 'ticket'];
  // Nama Tampilan Benda (Bilingual ID / EN)
  const ITEM_NAMES = {
    id: {
      scroll: 'Surat dari Ayah',
      album: 'Album Foto',
      map: 'Peta Rahasia',
      lantern: 'Lentera Tambang',
      ticket: 'Tiket Kereta'
    },
    en: {
      scroll: 'Letter from Father',
      album: 'Photo Album',
      map: 'Secret Map',
      lantern: 'Mining Lantern',
      ticket: 'Train Ticket'
    }
  };

  function getItemName(key) {
    const lang = (currentLang === 'en') ? 'en' : 'id';
    return (ITEM_NAMES[lang] && ITEM_NAMES[lang][key]) || ITEM_NAMES.id[key] || key;
  }

  // Data Terjemahan Bahasa Inggris untuk Relikui & Destinasi
  const ALBUM_EN_DATA = [
    {
      title: "History & Transformation of Sawahlunto",
      technique: "Historical Archives of Sawahlunto",
      collection: "Sastrowardoyo Heritage Chamber",
      status: "UNESCO World Heritage Site",
      desc: `<p style="margin-bottom: 10px;">Sawahlunto has a unique history, beginning in 1867 when Dutch geologist Ir. Willem Hendrik de Greve discovered massive coal reserves of 200 million tons along the Batang Ombilin river. This valuable discovery prompted the Dutch East Indies Government to design a modern industrial mining area and officially establish the City of Sawahlunto on December 1, 1888. To support coal transportation to Teluk Bayur Port in Padang, the Dutch built grand infrastructure networks, including railway tracks cutting through the Minangkabau hills. The construction and operation of the mine relied on thousands of forced laborers with prisoner status known as "Orang Rantai", equipped with supporting facilities such as the giant public kitchen Goedang Ransoem and the Lubang Mbah Soero tunnel.</p><p>As coal reserves depleted from World War II through the late 1970s, mine production fell sharply, triggering a massive migration of residents and leaving Sawahlunto at risk of becoming a "ghost town". Facing these conditions, the local government and community underwent a major transformation in the early 2000s, shifting the city's focus from extractive industries to a cultural heritage-based tourism destination and reclaiming former mining land. Hard work converting these historical relics culminated in 2019 when UNESCO officially declared the Ombilin Coal Mining Heritage of Sawahlunto as a World Heritage Site, confirming Sawahlunto's successful transformation into an educational heritage tourism destination.</p>`
    },
    {
      title: "History & Transformation of Sawahlunto",
      technique: "Historical Archives of Sawahlunto",
      collection: "Sastrowardoyo Heritage Chamber",
      status: "UNESCO World Heritage Site",
      desc: `<p style="margin-bottom: 10px;">Sawahlunto has a unique history, beginning in 1867 when Dutch geologist Ir. Willem Hendrik de Greve discovered massive coal reserves of 200 million tons along the Batang Ombilin river. This valuable discovery prompted the Dutch East Indies Government to design a modern industrial mining area and officially establish the City of Sawahlunto on December 1, 1888. To support coal transportation to Teluk Bayur Port in Padang, the Dutch built grand infrastructure networks, including railway tracks cutting through the Minangkabau hills. The construction and operation of the mine relied on thousands of forced laborers with prisoner status known as "Orang Rantai", equipped with supporting facilities such as the giant public kitchen Goedang Ransoem and the Lubang Mbah Soero tunnel.</p><p>As coal reserves depleted from World War II through the late 1970s, mine production fell sharply, triggering a massive migration of residents and leaving Sawahlunto at risk of becoming a "ghost town". Facing these conditions, the local government and community underwent a major transformation in the early 2000s, shifting the city's focus from extractive industries to a cultural heritage-based tourism destination and reclaiming former mining land. Hard work converting these historical relics culminated in 2019 when UNESCO officially declared the Ombilin Coal Mining Heritage of Sawahlunto as a World Heritage Site, confirming Sawahlunto's successful transformation into an educational heritage tourism destination.</p>`
    },
    {
      title: "History & Transformation of Sawahlunto",
      technique: "Historical Archives of Sawahlunto",
      collection: "Sastrowardoyo Heritage Chamber",
      status: "UNESCO World Heritage Site",
      desc: `<p style="margin-bottom: 10px;">Sawahlunto has a unique history, beginning in 1867 when Dutch geologist Ir. Willem Hendrik de Greve discovered massive coal reserves of 200 million tons along the Batang Ombilin river. This valuable discovery prompted the Dutch East Indies Government to design a modern industrial mining area and officially establish the City of Sawahlunto on December 1, 1888. To support coal transportation to Teluk Bayur Port in Padang, the Dutch built grand infrastructure networks, including railway tracks cutting through the Minangkabau hills. The construction and operation of the mine relied on thousands of forced laborers with prisoner status known as "Orang Rantai", equipped with supporting facilities such as the giant public kitchen Goedang Ransoem and the Lubang Mbah Soero tunnel.</p><p>As coal reserves depleted from World War II through the late 1970s, mine production fell sharply, triggering a massive migration of residents and leaving Sawahlunto at risk of becoming a "ghost town". Facing these conditions, the local government and community underwent a major transformation in the early 2000s, shifting the city's focus from extractive industries to a cultural heritage-based tourism destination and reclaiming former mining land. Hard work converting these historical relics culminated in 2019 when UNESCO officially declared the Ombilin Coal Mining Heritage of Sawahlunto as a World Heritage Site, confirming Sawahlunto's successful transformation into an educational heritage tourism destination.</p>`
    }
  ];

  const { lantern: LANTERN_EN_DATA, map: MAP_EN_DATA } = window.SawahluntoEnglish;
  const TICKET_EN_DATA = {
    title: "Mak Itam Steam Train Journey Ticket",
    reg: "STATE RAILWAYS PASS (SSS) REG: SWL-1894-05",
    date: "Sawahlunto Station - Emmahaven Port (Teluk Bayur)",
    heading: "Golden Ticket to Archipelago Freedom",
    author: "Staatsspoorwegen ter Sumatra's Westkust (SSS)",
    body: `<p class="quote-intro">"The whistle of Mak Itam echoes through the misty mountain valleys of West Sumatra..."</p><p>This historic ticket celebrates the completion of your investigation through the legacy of the Ombilin coal mines.</p><p>From the secret letter, the faces of the chained laborers, the underground mine plans, to the guide of the safety lantern—you have uncovered the soul of the Coal City and its triumph as a UNESCO World Heritage Site.</p>`,
    action: "Complete Mission & Celebrate Success 🎉"
  };
  // Data Gambar Locked & Unlocked
  const ITEM_IMAGES = {
    scroll: {
      locked: '../imge/terkunci_kertas-png.png',
      unlocked: '../imge/kertas.png.png'
    },
    album: {
      locked: '../imge/terkunci_ album_png.png',
      unlocked: '../imge/album.png.png'
    },
    map: {
      locked: '../imge/terkunci_peta_png.png',
      unlocked: '../imge/peta_png.png'
    },
    lantern: {
      locked: '../imge/terkunci_lentera_png.png',
      unlocked: '../imge/lentera_png.png'
    },
    ticket: {
      locked: '../imge/terkunci_tiket_png.png',
      unlocked: '../imge/tiket_png.png'
    }
  };
  // =========================================================================
  // FUNGSI HELPER: Membaca Data Konten dari HTML
  // =========================================================================
  function loadInspectionDataFromHTML() {
    const container = document.getElementById('inspectionDataContainer');
    if (!container) return {};
    const dataElements = container.querySelectorAll('.inspection-data');
    const data = {};
    dataElements.forEach(el => {
      const itemKey = el.getAttribute('data-item');
      const bodyEl = el.querySelector('.inspection-body');
      data[itemKey] = {
        kicker: el.getAttribute('data-kicker'),
        title: el.getAttribute('data-title'),
        reg: el.getAttribute('data-reg'),
        date: el.getAttribute('data-date'),
        heading: el.getAttribute('data-heading'),
        author: el.getAttribute('data-author'),
        bodyHtml: bodyEl ? bodyEl.innerHTML : '',
        actionBtnText: el.getAttribute('data-action'),
        nextItem: el.getAttribute('data-next') || null
      };
    });
    return data;
  }
  function loadAlbumDataFromHTML() {
    const container = document.getElementById('albumDataContainer');
    if (!container) return [];
    const slides = container.querySelectorAll('.album-slide');
    const data = [];
    slides.forEach(el => {
      const descEl = el.querySelector('.album-description');
      data.push({
        img: el.getAttribute('data-img'),
        plate: el.getAttribute('data-plate'),
        date: el.getAttribute('data-date'),
        title: el.getAttribute('data-title'),
        desc: descEl ? descEl.innerHTML : '',
        technique: el.getAttribute('data-technique'),
        collection: el.getAttribute('data-collection'),
        status: el.getAttribute('data-status')
      });
    });
    return data;
  }
  function loadMapDataFromHTML() {
    const container = document.getElementById('mapDataContainer');
    if (!container) return [];
    const destinations = container.querySelectorAll('.map-destination');
    const data = [];
    destinations.forEach(el => {
      data.push({
        name: el.getAttribute('data-name'),
        type: el.getAttribute('data-type'),
        img1: el.getAttribute('data-img1'),
        img2: el.getAttribute('data-img2'),
        desc: el.getAttribute('data-desc'),
        hours: el.getAttribute('data-hours'),
        closed: el.getAttribute('data-closed'),
        mapsUrl: el.getAttribute('data-maps')
      });
    });
    return data;
  }
  function loadLanternDataFromHTML() {
    const container = document.getElementById('lanternDataContainer');
    if (!container) return [];
    const slides = container.querySelectorAll('.lantern-slide');
    const data = [];
    slides.forEach(el => {
      const descEl = el.querySelector('.lantern-description');
      data.push({
        img: el.getAttribute('data-img'),
        plate: el.getAttribute('data-plate'),
        date: el.getAttribute('data-date'),
        title: el.getAttribute('data-title'),
        desc: descEl ? descEl.innerHTML : ''
      });
    });
    return data;
  }
  // Muat data dari HTML
  const RELIC_INSPECTION_DATA = loadInspectionDataFromHTML();
  const ALBUM_PHOTOS = loadAlbumDataFromHTML();
  const MAP_DESTINATIONS = loadMapDataFromHTML();
  const LANTERN_PHOTOS = loadLanternDataFromHTML();
  // Hanya kemajuan berurutan yang sah; status unlocked diturunkan dari langkah selesai.
  function normalizeQuestState(state) {
    const savedCompleted = Array.isArray(state?.completed) ? state.completed : [];
    const completed = [];
    for (const key of UNLOCK_SEQUENCE) {
      if (!savedCompleted.includes(key)) break;
      completed.push(key);
    }
    return {
      completed,
      unlocked: UNLOCK_SEQUENCE.slice(0, Math.min(completed.length + 1, UNLOCK_SEQUENCE.length))
    };
  }

  function canOpenRelic(itemKey) {
    const index = UNLOCK_SEQUENCE.indexOf(itemKey);
    return index >= 0 && UNLOCK_SEQUENCE.slice(0, index).every(key => questState.completed.includes(key));
  }

  // Muat status alur quest dari storage
  function loadQuestState() {
    try {
      const saved = localStorage.getItem(QUEST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return normalizeQuestState(parsed);
      }
    } catch (e) {
      console.warn('Gagal memuat status quest:', e);
    }
    // Default awal: HANYA surat yang unlocked
    return {
      unlocked: ['scroll'],
      completed: []
    };
  }
  function saveQuestState(state) {
    Object.assign(state, normalizeQuestState(state));
    try {
      localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Gagal menyimpan status quest:', e);
    }
  }
  let questState = loadQuestState();
  let currentlyInspectingKey = null;
  // DOM Elements di kotak_terbuka_page.html
  const inspectionModal = document.getElementById('inspectionModal');
  const btnCloseInspection = document.getElementById('btnCloseInspection');
  const inspectTitle = document.getElementById('inspectTitle');
  const parchmentReg = document.getElementById('parchmentReg');
  const parchmentDate = document.getElementById('parchmentDate');
  const parchmentHeading = document.getElementById('parchmentHeading');
  const parchmentBody = document.getElementById('parchmentBody');
  const parchmentAuthor = document.getElementById('parchmentAuthor');
  const btnStepUnlock = document.getElementById('btnStepUnlock');
  const btnStepText = document.getElementById('btnStepText');
  const chestActionSubtext = document.getElementById('chestActionSubtext');
  const trackerSteps = document.getElementById('trackerSteps');
  const btnOpenAllItems = document.getElementById('btnOpenAllItems');
  const btnResetQuest = document.getElementById('btnResetQuest');
  // Perbarui Seluruh Tampilan Visual Peti Berdasarkan Status Quest
  function updateChestVisuals() {
    if (!inspectionModal) return;
    // Cari item yang saat ini menjadi antrean aktif (pertama kali unlocked tapi belum completed)
    const activeItemKey = UNLOCK_SEQUENCE.find(key => questState.unlocked.includes(key) && !questState.completed.includes(key)) || null;
    UNLOCK_SEQUENCE.forEach((key, index) => {
      const itemEl = document.querySelector(`.inventory-item[data-item="${key}"]`);
      if (!itemEl) return;
      const imgEl = itemEl.querySelector('img');
      const badgeEl = itemEl.querySelector('.lock-indicator-badge');
      const isUnlocked = questState.unlocked.includes(key);
      const isCompleted = questState.completed.includes(key);
      const isActive = (key === activeItemKey);
      itemEl.setAttribute('aria-disabled', String(!isUnlocked));
      // 1. Atur Class State
      itemEl.classList.remove('is-locked', 'is-unlocked', 'is-completed', 'pulse-target');
      if (isCompleted) {
        itemEl.classList.add('is-completed', 'is-unlocked');
        if (badgeEl) badgeEl.style.display = 'none';
      } else if (isUnlocked) {
        itemEl.classList.add('is-unlocked');
        if (isActive) itemEl.classList.add('pulse-target');
        if (badgeEl) badgeEl.style.display = 'none';
      } else {
        itemEl.classList.add('is-locked');
        if (badgeEl) badgeEl.style.display = 'none';
      }
      // 2. Ganti Aset Gambar (Unlocked vs Locked)
      if (imgEl && ITEM_IMAGES[key]) {
        if (isUnlocked || isCompleted) {
          imgEl.src = ITEM_IMAGES[key].unlocked;
        } else {
          imgEl.src = ITEM_IMAGES[key].locked;
        }
      }
      // 3. Tooltip Status
      const name = getItemName(key);
      const isEn = (currentLang === 'en');
      if (imgEl) imgEl.alt = name;
      if (isCompleted) {
        itemEl.title = isEn
          ? `${name} (Inspected - Click to read again)`
          : `${name} (Selesai Diinspeksi - Klik untuk baca ulang)`;
      } else if (isUnlocked) {
        itemEl.title = isEn
          ? `${name} (Unlocked - Ready to Open!)`
          : `${name} (Terbuka - Siap Dibuka!)`;
      } else {
        const prevKey = UNLOCK_SEQUENCE[index - 1];
        const prevName = getItemName(prevKey);
        itemEl.title = isEn
          ? `${name} (Locked - Complete ${prevName} first)`
          : `${name} (Terkunci - Selesaikan ${prevName} terlebih dahulu)`;
      }
      itemEl.setAttribute('aria-label', itemEl.title);
    });
    const progressText = document.getElementById('explorationProgressText');
    const progressBar = document.getElementById('explorationProgressBar');
    const nextStep = document.getElementById('explorationNextStep');
    const finished = UNLOCK_SEQUENCE.filter(key => questState.completed.includes(key)).length;
    const english = currentLang === 'en';
    if (progressText) progressText.textContent = english
      ? `${finished} of ${UNLOCK_SEQUENCE.length} objects explored`
      : `${finished} dari ${UNLOCK_SEQUENCE.length} benda selesai ditelusuri`;
    if (progressBar) {
      progressBar.max = UNLOCK_SEQUENCE.length;
      progressBar.value = finished;
      progressBar.textContent = english ? `${finished} of ${UNLOCK_SEQUENCE.length}` : `${finished} dari ${UNLOCK_SEQUENCE.length}`;
    }
    if (nextStep) nextStep.textContent = activeItemKey
      ? (english ? `Next: Open ${getItemName(activeItemKey)}` : `Berikutnya: Buka ${getItemName(activeItemKey)}`)
      : (english ? 'All stories discovered. Revisit any object.' : 'Semua kisah ditemukan. Buka kembali benda untuk membaca ulang.');
    // 4. Perbarui Step Tracker di Atas
    if (trackerSteps) {
      const isEn = (currentLang === 'en');
      const chips = trackerSteps.querySelectorAll('.step-chip');
      chips.forEach((chip) => {
        const stepKey = chip.getAttribute('data-step');
        chip.classList.remove('active', 'completed', 'locked');
        if (questState.completed.includes(stepKey)) {
          chip.classList.add('completed');
          chip.innerHTML = `✓ ${getItemName(stepKey)}`;
        } else if (stepKey === activeItemKey) {
          chip.classList.add('active');
          chip.innerHTML = isEn ? `${getItemName(stepKey)} (Open)` : `${getItemName(stepKey)} (Buka)`;
        } else {
          chip.classList.add('locked');
          chip.innerHTML = `${getItemName(stepKey)}`;
        }
      });
    }
    // 5. Perbarui Subteks Tombol Buka Benda
    if (chestActionSubtext) {
      const isEn = (currentLang === 'en');
      if (activeItemKey) {
        chestActionSubtext.textContent = isEn
          ? `Your turn: Open ${getItemName(activeItemKey)} to continue`
          : `Giliran Anda: Buka ${getItemName(activeItemKey)} untuk melanjutkan`;
      } else {
        chestActionSubtext.textContent = isEn
          ? '🎉 Congratulations! All heritage relics have been successfully inspected!'
          : '🎉 Selamat! Seluruh relikui peninggalan Ayah telah berhasil dibuka lengkap!';
      }
    }
  }
  // Tampilkan Popup Bilik Inspeksi untuk Item Tertentu
  function openInspectionModal(itemKey) {
    const data = RELIC_INSPECTION_DATA[itemKey];
    if (!data || !inspectionModal) return;
    currentlyInspectingKey = itemKey;
    const isEn = (currentLang === 'en');

    const translated = itemKey === 'ticket'
      ? { ...TICKET_EN_DATA, bodyHtml: TICKET_EN_DATA.body, actionBtnText: TICKET_EN_DATA.action }
      : window.SawahluntoEnglish.inspection[itemKey];
    const content = isEn ? translated : data;
    document.getElementById('inspectKicker').textContent = isEn ? 'SAWAHLUNTO RELIC INSPECTION ROOM' : data.kicker;
    inspectTitle.textContent = content.title;
    parchmentReg.textContent = content.reg;
    parchmentDate.textContent = content.date;
    parchmentHeading.textContent = content.heading;
    parchmentAuthor.textContent = content.author;
    parchmentBody.innerHTML = content.bodyHtml;
    btnStepText.textContent = content.actionBtnText;
    inspectionModal.classList.add('active');
  }
  // Tutup Modal
  function closeInspectionModal() {
    if (inspectionModal) {
      inspectionModal.classList.remove('active');
      currentlyInspectingKey = null;
    }
  }
  if (btnCloseInspection) {
    btnCloseInspection.addEventListener('click', closeInspectionModal);
  }
  if (inspectionModal) {
    inspectionModal.addEventListener('click', (e) => {
      if (e.target === inspectionModal) {
        closeInspectionModal();
      }
    });
  }
  // =========================================================================
  // LOGIKA MODAL KHUSUS: ALBUM FOTO SEPIA 1894
  // =========================================================================
  let currentPhotoIndex = 0;
  const albumInspectionModal = document.getElementById('albumInspectionModal');
  const btnCloseAlbumInspection = document.getElementById('btnCloseAlbumInspection');
  const btnCloseAlbumModal = document.getElementById('btnCloseAlbumModal');
  const btnUnlockMapStep = document.getElementById('btnUnlockMapStep');
  const albumDisplayImg = document.getElementById('albumDisplayImg');
  const photoPlateCaption = document.getElementById('photoPlateCaption');
  const albumCounterBadge = document.getElementById('albumCounterBadge');
  const photoDateKicker = document.getElementById('photoDateKicker');
  const photoTitleHeading = document.getElementById('photoTitleHeading');
  const photoNarrativeText = document.getElementById('photoNarrativeText');
  const specTechnique = document.getElementById('specTechnique');
  const specCollection = document.getElementById('specCollection');
  const specStatus = document.getElementById('specStatus');
  const btnPrevPhoto = document.getElementById('btnPrevPhoto');
  const btnNextPhoto = document.getElementById('btnNextPhoto');
  const albumDotsIndicator = document.getElementById('albumDotsIndicator');
  function renderAlbumSlide(index) {
    if (!ALBUM_PHOTOS[index]) return;
    currentPhotoIndex = index;
    const item = ALBUM_PHOTOS[index];
    const isEn = (currentLang === 'en');
    const enItem = ALBUM_EN_DATA[index] || {};

    if (albumDisplayImg) {
      albumDisplayImg.style.opacity = '0';
      setTimeout(() => {
        albumDisplayImg.src = item.img;
        albumDisplayImg.style.opacity = '1';
      }, 150);
    }
    if (photoPlateCaption) {
      photoPlateCaption.textContent = isEn
        ? `Photo Documentation #${String(index + 1).padStart(2, '0')}`
        : item.plate;
    }
    if (albumCounterBadge) {
      albumCounterBadge.textContent = isEn
        ? `Photo ${index + 1} of ${ALBUM_PHOTOS.length}`
        : `Foto ${index + 1} dari ${ALBUM_PHOTOS.length}`;
    }
    if (photoDateKicker) photoDateKicker.textContent = item.date;
    if (photoTitleHeading) {
      photoTitleHeading.textContent = isEn ? (enItem.title || item.title) : item.title;
    }
    if (photoNarrativeText) {
      photoNarrativeText.innerHTML = isEn ? (enItem.desc || item.desc) : item.desc;
    }
    if (specTechnique) {
      specTechnique.textContent = isEn ? (enItem.technique || item.technique) : item.technique;
    }
    if (specCollection) {
      specCollection.textContent = isEn ? (enItem.collection || item.collection) : item.collection;
    }
    if (specStatus) {
      specStatus.textContent = isEn ? (enItem.status || item.status) : item.status;
    }
    if (btnPrevPhoto) btnPrevPhoto.disabled = (index === 0);
    if (btnNextPhoto) btnNextPhoto.disabled = (index === ALBUM_PHOTOS.length - 1);
    if (albumDotsIndicator) {
      const dots = albumDotsIndicator.querySelectorAll('.dot');
      dots.forEach((dot, dotIdx) => {
        dot.classList.toggle('active', dotIdx === index);
      });
    }
  }
  function openAlbumModal() {
    if (window.SawahluntoRelics?.album) return window.SawahluntoRelics.album.open(document.activeElement);
    if (!albumInspectionModal) return;
    renderAlbumSlide(0);
    albumInspectionModal.classList.add('active');
  }
  function closeAlbumModal() {
    if (window.SawahluntoRelics?.album) return window.SawahluntoRelics.album.close();
    if (albumInspectionModal) {
      albumInspectionModal.classList.remove('active');
    }
  }
  if (btnPrevPhoto) {
    btnPrevPhoto.addEventListener('click', () => {
      if (currentPhotoIndex > 0) renderAlbumSlide(currentPhotoIndex - 1);
    });
  }
  if (btnNextPhoto) {
    btnNextPhoto.addEventListener('click', () => {
      if (currentPhotoIndex < ALBUM_PHOTOS.length - 1) renderAlbumSlide(currentPhotoIndex + 1);
    });
  }
  if (albumDotsIndicator) {
    const dots = albumDotsIndicator.querySelectorAll('.dot');
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(idx)) renderAlbumSlide(idx);
      });
    });
  }
  if (btnCloseAlbumInspection) btnCloseAlbumInspection.addEventListener('click', closeAlbumModal);
  if (btnCloseAlbumModal) btnCloseAlbumModal.addEventListener('click', closeAlbumModal);
  if (albumInspectionModal) {
    albumInspectionModal.addEventListener('click', (e) => {
      if (e.target === albumInspectionModal) closeAlbumModal();
    });
  }
  // Tombol Selesai Meneliti Album & Buka Peta Terowongan
  if (btnUnlockMapStep) {
    btnUnlockMapStep.addEventListener('click', () => {
      if (!canOpenRelic('album')) return;
      if (!questState.completed.includes('album')) {
        questState.completed.push('album');
      }
      if (!questState.unlocked.includes('map')) {
        questState.unlocked.push('map');
      }
      saveQuestState(questState);
      closeAlbumModal();
      updateChestVisuals();
      const msg = () => (currentLang === 'en')
        ? '✨ You’ve explored the Photo Album. The Secret Map is now unlocked!'
        : '✨ Sukses! Album Foto selesai diinspeksi. Peta Rahasia kini telah terbuka!';
      showToast(msg);
    });
  }
  // =========================================================================
  // LOGIKA MODAL KHUSUS: DESTINASI PARIWISATA SAWAHLUNTO (PETA & DOKUMENTASI)
  // =========================================================================
  let currentMapDestIndex = 0;
  let currentMapPhotoSubIndex = 1;
  const mapInspectionModal = document.getElementById('mapInspectionModal');
  const btnCloseMapInspection = document.getElementById('btnCloseMapInspection');
  const btnCloseMapModal = document.getElementById('btnCloseMapModal');
  const btnUnlockLanternStep = document.getElementById('btnUnlockLanternStep');
  const mapDisplayImg = document.getElementById('mapDisplayImg');
  const mapPlateCaption = document.getElementById('mapPlateCaption');
  const mapLocationKicker = document.getElementById('mapLocationKicker');
  const mapLocationTitle = document.getElementById('mapLocationTitle');
  const mapLocationDesc = document.getElementById('mapLocationDesc');
  const specMapHours = document.getElementById('specMapHours');
  const specMapClosed = document.getElementById('specMapClosed');
  const btnMapExternalLink = document.getElementById('btnMapExternalLink');
  const specMapLinkAnchor = document.getElementById('specMapLinkAnchor');
  const btnMapPhoto1 = document.getElementById('btnMapPhoto1');
  const btnMapPhoto2 = document.getElementById('btnMapPhoto2');
  const mapPointButtons = document.querySelectorAll('.btn-map-point');
  function renderMapDestination(destIdx, photoSubIdx = 1) {
    if (!MAP_DESTINATIONS[destIdx]) return;
    currentMapDestIndex = destIdx;
    currentMapPhotoSubIndex = photoSubIdx;
    const item = MAP_DESTINATIONS[destIdx];
    const isEn = (currentLang === 'en');
    const enItem = MAP_EN_DATA[destIdx] || {};

    const imgSrc = (photoSubIdx === 2 && item.img2) ? item.img2 : item.img1;
    const destName = isEn ? (enItem.name || item.name) : item.name;
    if (mapDisplayImg) {
      mapDisplayImg.style.opacity = '0';
      setTimeout(() => {
        mapDisplayImg.src = imgSrc;
        mapDisplayImg.alt = destName;
        mapDisplayImg.style.opacity = '1';
      }, 120);
    }
    if (mapPlateCaption) {
      mapPlateCaption.textContent = isEn
        ? `📍 ${destName} (Photo ${photoSubIdx}/2)`
        : `📍 ${destName} (Foto ${photoSubIdx}/2)`;
    }
    if (mapLocationKicker) mapLocationKicker.textContent = isEn ? (enItem.type || item.type) : item.type;
    if (mapLocationTitle) mapLocationTitle.textContent = destName;
    if (mapLocationDesc) mapLocationDesc.textContent = isEn ? (enItem.desc || item.desc) : item.desc;
    if (specMapHours) specMapHours.textContent = isEn ? (enItem.hours || item.hours) : item.hours;
    if (specMapClosed) specMapClosed.textContent = isEn ? (enItem.closed || item.closed) : item.closed;
    if (btnMapExternalLink) btnMapExternalLink.href = item.mapsUrl;
    if (specMapLinkAnchor) specMapLinkAnchor.href = item.mapsUrl;
    if (btnMapPhoto1) btnMapPhoto1.classList.toggle('active', photoSubIdx === 1);
    if (btnMapPhoto2) btnMapPhoto2.classList.toggle('active', photoSubIdx === 2);
    mapPointButtons.forEach((btn) => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      btn.classList.toggle('active', idx === destIdx);
    });
  }
  function openMapModal() {
    if (window.SawahluntoRelics?.map) return window.SawahluntoRelics.map.open(document.activeElement);
    if (!mapInspectionModal) return;
    renderMapDestination(0, 1);
    mapInspectionModal.classList.add('active');
  }
  function closeMapModal() {
    if (window.SawahluntoRelics?.map) return window.SawahluntoRelics.map.close();
    if (mapInspectionModal) {
      mapInspectionModal.classList.remove('active');
    }
  }
  // Listener Tombol Switcher Foto 1 / Foto 2
  if (btnMapPhoto1) {
    btnMapPhoto1.addEventListener('click', () => {
      renderMapDestination(currentMapDestIndex, 1);
    });
  }
  if (btnMapPhoto2) {
    btnMapPhoto2.addEventListener('click', () => {
      renderMapDestination(currentMapDestIndex, 2);
    });
  }
  // Listener 6 Tombol Destinasi Wisata
  if (mapPointButtons.length > 0) {
    mapPointButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          renderMapDestination(idx, 1);
        }
      });
    });
  }
  if (btnCloseMapInspection) btnCloseMapInspection.addEventListener('click', closeMapModal);
  if (btnCloseMapModal) btnCloseMapModal.addEventListener('click', closeMapModal);
  if (mapInspectionModal) {
    mapInspectionModal.addEventListener('click', (e) => {
      if (e.target === mapInspectionModal) {
        closeMapModal();
      }
    });
  }
  // Tombol Selesai Mempelajari Peta & Buka Lentera Tambang
  if (btnUnlockLanternStep) {
    btnUnlockLanternStep.addEventListener('click', () => {
      if (!canOpenRelic('map')) return;
      if (!questState.completed.includes('map')) {
        questState.completed.push('map');
      }
      if (!questState.unlocked.includes('lantern')) {
        questState.unlocked.push('lantern');
      }
      saveQuestState(questState);
      closeMapModal();
      updateChestVisuals();
      const msg = () => (currentLang === 'en')
        ? '✨ You’ve explored the Secret Map. The Mining Lantern is now unlocked!'
        : '✨ Sukses! Peta Rahasia selesai dipelajari. Lentera Tambang kini telah terbuka!';
      showToast(msg);
    });
  }
  // =========================================================================
  // LOGIKA MODAL KHUSUS: LENTERA TAMBANG & SEJARAH SAWAHLUNTO (SEDERHANA)
  // =========================================================================
  let currentLanternIndex = 0;
  const lanternInspectionModal = document.getElementById('lanternInspectionModal');
  const btnCloseLanternInspection = document.getElementById('btnCloseLanternInspection');
  const btnCloseLanternModal = document.getElementById('btnCloseLanternModal');
  const btnUnlockTicketStep = document.getElementById('btnUnlockTicketStep');
  const lanternDisplayImg = document.getElementById('lanternDisplayImg');
  const lanternPlateCaption = document.getElementById('lanternPlateCaption');
  const lanternCounterBadge = document.getElementById('lanternCounterBadge');
  const lanternDateKicker = document.getElementById('lanternDateKicker');
  const lanternTitleHeading = document.getElementById('lanternTitleHeading');
  const lanternNarrativeText = document.getElementById('lanternNarrativeText');
  const btnPrevLantern = document.getElementById('btnPrevLantern');
  const btnNextLantern = document.getElementById('btnNextLantern');
  const lanternDotsIndicator = document.getElementById('lanternDotsIndicator');
  function renderLanternSlide(index) {
    if (!LANTERN_PHOTOS[index]) return;
    currentLanternIndex = index;
    const item = LANTERN_PHOTOS[index];
    const isEn = (currentLang === 'en');
    const enItem = LANTERN_EN_DATA[index] || {};

    if (lanternDisplayImg) {
      lanternDisplayImg.style.opacity = '0';
      setTimeout(() => {
        lanternDisplayImg.src = item.img;
        lanternDisplayImg.style.opacity = '1';
      }, 150);
    }
    if (lanternPlateCaption) {
      lanternPlateCaption.textContent = isEn
        ? `Photo Documentation #${String(index + 1).padStart(2, '0')}`
        : item.plate;
    }
    if (lanternCounterBadge) {
      lanternCounterBadge.textContent = isEn
        ? `Photo ${index + 1} of ${LANTERN_PHOTOS.length}`
        : `Foto ${index + 1} dari ${LANTERN_PHOTOS.length}`;
    }
    if (lanternDateKicker) lanternDateKicker.textContent = item.date;
    if (lanternTitleHeading) {
      lanternTitleHeading.textContent = isEn ? (enItem.title || item.title) : item.title;
    }
    if (lanternNarrativeText) {
      lanternNarrativeText.innerHTML = isEn ? (enItem.desc || item.desc) : item.desc;
    }
    if (btnPrevLantern) btnPrevLantern.disabled = (index === 0);
    if (btnNextLantern) btnNextLantern.disabled = (index === LANTERN_PHOTOS.length - 1);
    if (lanternDotsIndicator) {
      const dots = lanternDotsIndicator.querySelectorAll('.dot');
      dots.forEach((dot, dotIdx) => {
        dot.classList.toggle('active', dotIdx === index);
      });
    }
  }
  function openLanternModal() {
    if (window.SawahluntoRelics?.lantern) return window.SawahluntoRelics.lantern.open(document.activeElement);
    if (!lanternInspectionModal) return;
    renderLanternSlide(0);
    lanternInspectionModal.classList.add('active');
  }
  function closeLanternModal() {
    if (window.SawahluntoRelics?.lantern) return window.SawahluntoRelics.lantern.close();
    if (lanternInspectionModal) {
      lanternInspectionModal.classList.remove('active');
    }
  }
  if (btnPrevLantern) {
    btnPrevLantern.addEventListener('click', () => {
      if (currentLanternIndex > 0) renderLanternSlide(currentLanternIndex - 1);
    });
  }
  if (btnNextLantern) {
    btnNextLantern.addEventListener('click', () => {
      if (currentLanternIndex < LANTERN_PHOTOS.length - 1) renderLanternSlide(currentLanternIndex + 1);
    });
  }
  if (lanternDotsIndicator) {
    const dots = lanternDotsIndicator.querySelectorAll('.dot');
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(idx)) renderLanternSlide(idx);
      });
    });
  }
  if (btnCloseLanternInspection) btnCloseLanternInspection.addEventListener('click', closeLanternModal);
  if (btnCloseLanternModal) btnCloseLanternModal.addEventListener('click', closeLanternModal);
  if (lanternInspectionModal) {
    lanternInspectionModal.addEventListener('click', (e) => {
      if (e.target === lanternInspectionModal) closeLanternModal();
    });
  }
  // Tombol Selesai Menelusuri Sejarah & Buka Tiket Kereta
  if (btnUnlockTicketStep) {
    btnUnlockTicketStep.addEventListener('click', () => {
      if (!canOpenRelic('lantern')) return;
      if (!questState.completed.includes('lantern')) {
        questState.completed.push('lantern');
      }
      if (!questState.unlocked.includes('ticket')) {
        questState.unlocked.push('ticket');
      }
      saveQuestState(questState);
      closeLanternModal();
      updateChestVisuals();
      const msg = () => (currentLang === 'en')
        ? '✨ You’ve explored the Mining Lantern. The Train Ticket is now unlocked!'
        : '✨ Sukses! Lentera Tambang selesai ditelusuri. Tiket Kereta kini telah terbuka!';
      showToast(msg);
    });
  }
  // =========================================================================
  // LOGIKA MODAL KHUSUS: SURAT DARI AYAH (TAMPILAN GAMBAR surat-2.png)
  // =========================================================================
  const scrollInspectionModal = document.getElementById('scrollInspectionModal');
  const btnCloseScrollInspection = document.getElementById('btnCloseScrollInspection');
  const btnCloseScrollModal = document.getElementById('btnCloseScrollModal');
  const btnUnlockAlbumStep = document.getElementById('btnUnlockAlbumStep');

  function openScrollModal() {
    if (!scrollInspectionModal) return;
    scrollInspectionModal.classList.add('active');
  }

  function closeScrollModal() {
    if (scrollInspectionModal) {
      scrollInspectionModal.classList.remove('active');
    }
  }

  if (btnCloseScrollInspection) btnCloseScrollInspection.addEventListener('click', closeScrollModal);
  if (btnCloseScrollModal) btnCloseScrollModal.addEventListener('click', closeScrollModal);
  if (scrollInspectionModal) {
    scrollInspectionModal.addEventListener('click', (e) => {
      if (e.target === scrollInspectionModal) closeScrollModal();
    });
  }

  // Tombol Selesai Membaca & Buka Album Foto
  if (btnUnlockAlbumStep) {
    btnUnlockAlbumStep.addEventListener('click', () => {
      if (!canOpenRelic('scroll')) return;
      if (!questState.completed.includes('scroll')) {
        questState.completed.push('scroll');
      }
      if (!questState.unlocked.includes('album')) {
        questState.unlocked.push('album');
      }
      saveQuestState(questState);
      closeScrollModal();
      updateChestVisuals();
      const msg = () => (currentLang === 'en')
        ? '✨ You’ve read the letter from Father. The Photo Album is now unlocked!'
        : '✨ Sukses! Surat dari Ayah selesai diinspeksi. Album Foto kini telah terbuka!';
      showToast(msg);
    });
  }

  // Buka Bilik Inspeksi, Album, Peta, Lentera, atau Surat sesuai Tipe Benda
  const ticketDialog = document.getElementById('ticketDialog');
  document.querySelectorAll('[data-close-ticket]').forEach(button => {
    button.addEventListener('click', () => ticketDialog?.close());
  });
  ticketDialog?.addEventListener('click', event => {
    if (event.target !== ticketDialog) return;
    const rect = ticketDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) ticketDialog.close();
  });
  const ticketLogout = document.getElementById('btnTicketLogout');
  ticketLogout?.addEventListener('click', async () => {
    if (ticketLogout.disabled) return;
    ticketLogout.disabled = true;
    try {
      await window.sawahFirebase.signOut();
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(LETTER_OPENED_KEY);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(QUEST_STORAGE_KEY);
      navigateWithMusic('login_page.html');
    } catch (error) {
      console.warn('Firebase sign-out:', error.code || error.message);
      showToast(() => currentLang === 'en'
        ? 'Could not log out. Check your connection and try again.'
        : 'Logout belum berhasil. Periksa koneksi dan coba lagi.', true);
    } finally {
      ticketLogout.disabled = false;
    }
  });
  function openRelicItem(itemKey) {
    playClickSound(itemKey === 'scroll' && canOpenRelic(itemKey) ? 'letter' : 'button');
    if (!canOpenRelic(itemKey)) {
      updateChestVisuals();
      const requiredKey = UNLOCK_SEQUENCE.find(key => !questState.completed.includes(key));
      showToast(() => currentLang === 'en'
        ? `This item is still locked. First, explore: ${getItemName(requiredKey)}.`
        : `Barang ini masih terkunci! Selesaikan ${getItemName(requiredKey)} terlebih dahulu.`, true);
      return;
    }
    if (itemKey === 'scroll') {
      openScrollModal();
    } else if (itemKey === 'album') {
      openAlbumModal();
    } else if (itemKey === 'map') {
      openMapModal();
    } else if (itemKey === 'lantern') {
      openLanternModal();
    } else if (itemKey === 'ticket' && ticketDialog) {
      if (!questState.completed.includes('ticket')) {
        questState.completed.push('ticket');
        saveQuestState(questState);
        updateChestVisuals();
      }
      if (!ticketDialog.open) ticketDialog.showModal();
    } else {
      openInspectionModal(itemKey);
    }
  }
  // Event Listener Klik Benda di Dalam Peti
  const inventoryItems = document.querySelectorAll('.inventory-item');
  if (inventoryItems.length > 0) {
    inventoryItems.forEach((itemEl) => {
      itemEl.addEventListener('click', () => {
        const itemKey = itemEl.getAttribute('data-item');
        const isUnlocked = canOpenRelic(itemKey);
        if (!isUnlocked) {
          playClickSound('button');
          itemEl.classList.remove('shake-anim');
          void itemEl.offsetWidth; // trigger reflow
          itemEl.classList.add('shake-anim');
          const itemIndex = UNLOCK_SEQUENCE.indexOf(itemKey);
          const requiredPrevKey = UNLOCK_SEQUENCE[itemIndex - 1];
          const lockMsg = () => (currentLang === 'en')
            ? `This item is still locked. First, explore: ${getItemName(requiredPrevKey)}.`
            : `Barang ini masih terkunci! Anda harus membuka ${getItemName(requiredPrevKey)} terlebih dahulu.`;
          showToast(lockMsg, true);
          return;
        }
        openRelicItem(itemKey);
      });
    });
  }
  // Tombol Selesai Membaca & Buka Benda Berikutnya di dalam Modal Naskah
  if (btnStepUnlock) {
    btnStepUnlock.addEventListener('click', () => {
      if (!currentlyInspectingKey) return;
      const currentKey = currentlyInspectingKey;
      if (!canOpenRelic(currentKey)) return;
      const data = RELIC_INSPECTION_DATA[currentKey];
      if (!questState.completed.includes(currentKey)) {
        questState.completed.push(currentKey);
      }
      if (data && data.nextItem) {
        const nextKey = data.nextItem;
        if (!questState.unlocked.includes(nextKey)) {
          questState.unlocked.push(nextKey);
        }
        saveQuestState(questState);
        closeInspectionModal();
        updateChestVisuals();
        const stepMsg = () => (currentLang === 'en')
          ? `✨ You explored ${getItemName(currentKey)}. Next up: ${getItemName(nextKey)}!`
          : `✨ Sukses! ${getItemName(currentKey)} selesai diinspeksi. ${getItemName(nextKey)} kini telah terbuka!`;
        showToast(stepMsg);
      } else {
        saveQuestState(questState);
        closeInspectionModal();
        updateChestVisuals();
        const finishMsg = () => (currentLang === 'en')
          ? '🏆 Well done! You’ve explored all five keepsakes from Father.'
          : '🏆 Luar biasa! Seluruh 5 relikui peninggalan Ayah telah berhasil Anda tuntaskan!';
        showToast(finishMsg);
      }
    });
  }
  // Tombol "Buka Benda" di Bawah Peti
  if (btnOpenAllItems) {
    btnOpenAllItems.addEventListener('click', () => {
      const activeKey = UNLOCK_SEQUENCE.find(key => questState.unlocked.includes(key) && !questState.completed.includes(key));
      if (activeKey) {
        openRelicItem(activeKey);
      } else {
        openRelicItem('scroll');
      }
    });
  }
  // Tombol Reset Quest
  if (btnResetQuest) {
    btnResetQuest.addEventListener('click', () => {
      if (ticketDialog?.open) ticketDialog.close();
      questState = {
        unlocked: ['scroll'],
        completed: []
      };
      saveQuestState(questState);
      closeInspectionModal();
      closeScrollModal();
      closeAlbumModal();
      closeLanternModal();
      closeMapModal();
      updateChestVisuals();
      const resetMsg = () => (currentLang === 'en')
        ? 'Your journey has started over. Begin with the letter from Father.'
        : 'Alur penyelidikan relikui telah diulang dari awal (Surat terbuka).';
      showToast(resetMsg);
    });
  }
  // Inisialisasi Tampilan Awal Peti Terbuka & Sinkronisasi Bahasa
  updateChestVisuals();
  window.SawahluntoSetLanguage = applyTranslations;
  applyTranslations(currentLang);
});
