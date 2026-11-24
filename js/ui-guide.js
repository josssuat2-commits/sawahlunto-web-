(() => {
  'use strict';

  const toast = document.getElementById('guideToast');
  const english = () => window.SawahluntoLanguage() === 'en';
  const copy = (id, en) => english() ? en : id;
  let toastTimer;
  let toastMessage;
  function notify(message) {
    toastMessage = typeof message === 'function' ? message : () => message;
    clearTimeout(toastTimer);
    toast.textContent = toastMessage();
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      toast.textContent = '';
      toastMessage = null;
    }, 4000);
  }

  document.querySelectorAll('[data-demo]').forEach(button => {
    button.addEventListener('click', () => notify(() => button.dataset.demo));
  });
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        notify(() => copy('Disalin: ', 'Copied: ') + button.dataset.copy);
      } catch {
        notify(() => copy('Penyalinan tidak tersedia. Salin manual: ', 'Clipboard access is unavailable. Copy manually: ') + button.dataset.copy);
      }
    });
  });

  const loading = document.getElementById('guideLoading');
  loading.addEventListener('click', () => {
    loading.disabled = true;
    loading.setAttribute('aria-busy', 'true');
    loading.querySelector('span').textContent = copy('Memproses…', 'Processing…');
    loading.querySelector('.spinner').style.display = 'inline-block';
    setTimeout(() => {
      loading.disabled = false;
      loading.removeAttribute('aria-busy');
      loading.querySelector('span').textContent = copy('Mulai demo', 'Start demo');
      loading.querySelector('.spinner').style.display = 'none';
      notify(() => copy('Contoh proses selesai. Tombol kembali aktif.', 'The sample process is complete. The button is available again.'));
    }, 1500);
  });

  const language = document.getElementById('guideLanguage');
  language.addEventListener('click', () => {
    window.SawahluntoSetLanguage(english() ? 'id' : 'en');
    notify(() => copy('Bahasa diubah ke Bahasa Indonesia.', 'Language switched to English.'));
  });

  let slide = 1;
  const previous = document.getElementById('guidePrevious');
  const next = document.getElementById('guideNext');
  function moveSlide(change) {
    slide = Math.max(1, Math.min(3, slide + change));
    document.getElementById('guideSlide').textContent = copy('Foto ' + slide + ' dari 3', 'Photo ' + slide + ' of 3');
    previous.disabled = slide === 1;
    next.disabled = slide === 3;
  }
  previous.addEventListener('click', () => moveSlide(-1));
  next.addEventListener('click', () => moveSlide(1));
  const photoChoices = document.querySelectorAll('.guide-map-demo button');
  photoChoices.forEach(button => button.addEventListener('click', () => {
    photoChoices.forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
    notify(() => copy('Contoh tampilan foto: ', 'Sample photo view: ') + button.textContent.toLowerCase() + '.');
  }));

  const dialogOpeners = new WeakMap();
  const dialogs = [...document.querySelectorAll('dialog')];
  function syncModalScroll() {
    document.body.classList.toggle('guide-modal-open', dialogs.some(dialog => dialog.open));
  }
  document.querySelectorAll('[data-open-dialog]').forEach(button => {
    const targetId = button.dataset.openDialog || 'guideDialog';
    const dialog = document.getElementById(targetId);
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', targetId);
    button.addEventListener('click', () => {
      if (dialog.open) return;
      dialogOpeners.set(dialog, button);
      dialog.showModal();
      syncModalScroll();
    });
  });
  document.querySelectorAll('[data-close-dialog]').forEach(button => {
    button.addEventListener('click', () => button.closest('dialog').close());
  });
  dialogs.forEach(dialog => {
    dialog.addEventListener('close', () => {
      syncModalScroll();
      dialogOpeners.get(dialog)?.focus();
    });
    let startedOutside = false;
    function isOutside(event) {
      const box = dialog.getBoundingClientRect();
      return event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom);
    }
    dialog.addEventListener('pointerdown', event => { startedOutside = isOutside(event); });
    dialog.addEventListener('click', event => {
      if (startedOutside && isOutside(event)) dialog.close();
      startedOutside = false;
    });
  });
  const volume = document.getElementById('guideVolume');
  function updateVolume(change = 0) {
    volume.value = String(Math.max(0, Math.min(100, Number(volume.value) + change)));
    document.getElementById('guideVolumeValue').textContent = volume.value + '%';
    volume.setAttribute('aria-valuetext', volume.value + '%');
  }
  volume.addEventListener('input', () => updateVolume());
  document.getElementById('guideVolumeDown').addEventListener('click', () => updateVolume(-10));
  document.getElementById('guideVolumeUp').addEventListener('click', () => updateVolume(10));

  const form = document.getElementById('guideForm');
  const fields = [document.getElementById('guideName'), document.getElementById('guideInstitution')];
  function validate(field) {
    const valid = field.value.trim().length > 0;
    field.setAttribute('aria-invalid', String(!valid));
    document.getElementById(field.id + 'Error').textContent = valid ? '' : (field.id === 'guideName'
      ? copy('Silakan isi nama lengkap.', 'Please enter your full name.')
      : copy('Silakan isi asal institusi atau tulis Mandiri.', 'Please enter your institution or write Independent.'));
    return valid;
  }
  fields.forEach(field => field.addEventListener('input', () => {
    if (field.hasAttribute('aria-invalid')) validate(field);
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const invalid = fields.filter(field => !validate(field));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    notify(() => copy('Contoh formulir berhasil diisi. Data tidak dikirim atau disimpan.', 'The sample form is complete. No data was sent or saved.'));
  });

  function renderLanguage() {
    const en = english();
    language.setAttribute('aria-pressed', String(en));
    language.querySelector('[data-lang="id"]').classList.toggle('active', !en);
    language.querySelector('[data-lang="en"]').classList.toggle('active', en);
    language.setAttribute('aria-label', en ? 'Switch to Indonesian' : 'Ganti ke bahasa Inggris');
    loading.querySelector('span').textContent = loading.disabled ? copy('Memproses…', 'Processing…') : copy('Mulai demo', 'Start demo');
    moveSlide(0);
    fields.filter(field => field.hasAttribute('aria-invalid')).forEach(validate);
    if (toastMessage) toast.textContent = toastMessage();
  }
  document.addEventListener('sawahlunto:language', renderLanguage);
  renderLanguage();

  const navLinks = [...document.querySelectorAll('.guide-nav a')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
  let scheduled = false;
  function updateNavigation() {
    const active = sections.filter(section => section.getBoundingClientRect().top <= 140).pop() || sections[0];
    navLinks.forEach(link => {
      if (link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateNavigation);
    }
  }, { passive: true });
  window.addEventListener('resize', updateNavigation);
  updateNavigation();
})();
