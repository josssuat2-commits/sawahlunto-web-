document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('prototypeLantern');
  if (!modal) return;
  const content = document.getElementById('lanternSectionContent');
  const title = document.getElementById('lanternSectionTitle');
  const photo = document.getElementById('lanternSectionPhoto');
  const previous = document.getElementById('lanternPrevious');
  const next = document.getElementById('lanternNext');
  const complete = document.getElementById('btnUnlockTicketStep');
  let index = 0;
  let opener = null;
  const sound = new Audio('../sound/button_sound.mp3');
  sound.preload = 'auto';
  function playSound() { sound.currentTime = 0; sound.play().catch(() => {}); }

  let slides = Array.from(document.querySelectorAll('#prototypeLanternData .lantern-slide, #lanternDataContainer .lantern-slide'));
  function render(position) {
    index = Math.max(0, Math.min(slides.length - 1, position));
    const slide = slides[index];
    title.textContent = slide.dataset.title;
    photo.src = slide.dataset.img;
    photo.alt = slide.dataset.title;
    content.replaceChildren(slide.querySelector('.lantern-description').cloneNode(true));
    const english = window.SawahluntoLanguage?.() === 'en';
    const translated = window.SawahluntoEnglish?.lantern[index];
    if (english && translated) {
      title.textContent = translated.title;
      photo.alt = translated.title;
      content.innerHTML = translated.desc;
    }
    document.getElementById('lanternSectionNumber').textContent = index + 1;
    document.getElementById('lanternSectionCount').textContent = `${index + 1} / ${slides.length}`;
    previous.disabled = index === 0;
    next.textContent = index === slides.length - 1 ? 'SELESAI ✓' : 'LANJUT JELAJAH →';
    if (complete) {
      const finalSlide = index === slides.length - 1;
      next.hidden = finalSlide;
      complete.hidden = !finalSlide;
    }
    next.textContent = index === slides.length - 1
      ? (english ? 'FINISH ✓' : 'SELESAI ✓')
      : (english ? 'CONTINUE EXPLORING →' : 'LANJUT JELAJAH →');
    modal.querySelector('.lantern-prototype-body').scrollTop = 0;
  }

  function openLantern(button) {
    opener = button;
    render(0);
    if (!modal.open) modal.showModal();
  }
  window.SawahluntoRelics ??= {};
  window.SawahluntoRelics.lantern = { open: openLantern, close: () => modal.close() };
  document.addEventListener('sawahlunto:language', () => render(index));
  document.querySelectorAll('[data-open-lantern]').forEach(button => {
    button.addEventListener('click', () => { playSound(); openLantern(button); });
  });
  document.querySelectorAll('[data-close-lantern]').forEach(button => {
    button.addEventListener('click', () => { playSound(); modal.close(); });
  });
  previous.addEventListener('click', () => { playSound(); render(index - 1); });
  next.addEventListener('click', () => {
    playSound();
    if (index === slides.length - 1) modal.close();
    else render(index + 1);
  });
  modal.addEventListener('close', () => opener?.focus());
  modal.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      playSound();
      render(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  modal.addEventListener('click', event => {
    const box = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) modal.close();
  });
  render(0);
});
