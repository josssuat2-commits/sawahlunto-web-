document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('prototypeMap');
  if (!modal) return;
  let destinations = Array.from(document.querySelectorAll('#prototypeMapData .map-destination, #mapDataContainer .map-destination')).map(element => ({ ...element.dataset }));
  const frame = document.getElementById('prototypeMapFrame');
  const photo = document.getElementById('prototypeMapPhoto');
  const photoButtons = [document.getElementById('prototypeMapPhoto1'), document.getElementById('prototypeMapPhoto2')];
  const locationList = document.getElementById('prototypeMapLocations');
  const next = document.getElementById('prototypeMapNext');
  const complete = document.getElementById('btnUnlockLanternStep');
  let index = 0;
  let opener = null;
  let selectedPhoto = 0;
  const sound = new Audio('../sound/button_sound.mp3');
  sound.preload = 'auto';
  function playSound() { sound.currentTime = 0; sound.play().catch(() => {}); }

  function mapUrl(destination) {
    const query = `${destination.name}, Sawahlunto, Sumatera Barat, Indonesia`;
    const key = window.SAWAHLUNTO_MAPS_CONFIG?.apiKey?.trim();
    if (key) {
      const url = new URL('https://www.google.com/maps/embed/v1/place');
      url.searchParams.set('key', key);
      url.searchParams.set('q', query);
      url.searchParams.set('language', window.SawahluntoLanguage?.() || 'id');
      return url.href;
    }
    const preview = new URL('https://www.google.com/maps');
    preview.searchParams.set('q', query);
    preview.searchParams.set('output', 'embed');
    preview.searchParams.set('hl', window.SawahluntoLanguage?.() || 'id');
    return preview.href;
  }

  function renderPhoto(photoIndex) {
    selectedPhoto = photoIndex;
    const destination = destinations[index];
    photo.src = photoIndex === 0 ? destination.img1 : destination.img2;
    photo.alt = `${destination.name} — Foto ${photoIndex + 1}`;
    photoButtons.forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === photoIndex)));
    if (window.SawahluntoLanguage?.() === 'en') photo.alt = `${window.SawahluntoEnglish?.map[index]?.name || destination.name} — Photo ${photoIndex + 1}`;
  }

  const locationButtons = destinations.map((destination, destinationIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    const thumbnail = document.createElement('img');
    thumbnail.src = destination.img1;
    thumbnail.alt = '';
    thumbnail.loading = 'lazy';
    const label = document.createElement('span');
    label.textContent = destination.name;
    button.append(thumbnail, label);
    button.title = destination.name;
    button.setAttribute('aria-label', destination.name);
    button.addEventListener('click', () => { playSound(); render(destinationIndex); });
    locationList.append(button);
    return button;
  });

  function render(destinationIndex) {
    index = Math.max(0, Math.min(destinations.length - 1, destinationIndex));
    const destination = destinations[index];
    document.getElementById('prototypeMapName').textContent = destination.name;
    document.getElementById('prototypeMapDescription').textContent = destination.desc;
    document.getElementById('prototypeMapHours').textContent = destination.hours;
    document.getElementById('prototypeMapClosed').textContent = destination.closed;
    document.getElementById('prototypeMapLink').href = destination.maps;
    document.getElementById('prototypeMapCount').textContent = `${index + 1} / ${destinations.length}`;
    renderPhoto(0);
    if (modal.open) {
      const url = mapUrl(destination);
      if (frame.getAttribute('src') !== url) frame.src = url;
    }
    frame.title = `Google Maps — ${window.SawahluntoLanguage?.() === 'en' ? window.SawahluntoEnglish.map[index].name : destination.name}`;
    locationButtons.forEach((button, buttonIndex) => button.setAttribute('aria-current', String(buttonIndex === index)));
    next.textContent = index === destinations.length - 1 ? 'Selesai Eksplorasi ✓' : 'Lanjut Jelajah →';
    if (complete) {
      const finalLocation = index === destinations.length - 1;
      next.hidden = finalLocation;
      complete.hidden = !finalLocation;
    }
    const english = window.SawahluntoLanguage?.() === 'en';
    const translated = window.SawahluntoEnglish?.map[index];
    if (english && translated) {
      document.getElementById('prototypeMapName').textContent = translated.name;
      document.getElementById('prototypeMapDescription').textContent = translated.desc;
      document.getElementById('prototypeMapHours').textContent = translated.hours;
      document.getElementById('prototypeMapClosed').textContent = translated.closed;
    }
    locationButtons.forEach((button, position) => {
      const name = english ? window.SawahluntoEnglish?.map[position]?.name || destinations[position].name : destinations[position].name;
      button.querySelector('span').textContent = name;
      button.title = name;
      button.setAttribute('aria-label', name);
    });
    next.textContent = index === destinations.length - 1
      ? (english ? 'Finish Exploring ✓' : 'Selesai Eksplorasi ✓')
      : (english ? 'Continue Exploring →' : 'Lanjut Jelajah →');
  }

  function openMap(button) {
    opener = button;
    if (!modal.open) modal.showModal();
    render(0);
    modal.querySelector('.map-prototype-body').scrollTop = 0;
  }
  window.SawahluntoRelics ??= {};
  window.SawahluntoRelics.map = { open: openMap, close: () => modal.close() };
  document.addEventListener('sawahlunto:language', () => {
    const previousPhoto = selectedPhoto;
    render(index);
    renderPhoto(previousPhoto);
  });
  document.querySelectorAll('[data-open-map]').forEach(button => {
    button.addEventListener('click', () => { playSound(); openMap(button); });
  });
  document.querySelectorAll('[data-close-map]').forEach(button => {
    button.addEventListener('click', () => { playSound(); modal.close(); });
  });
  photoButtons.forEach((button, photoIndex) => button.addEventListener('click', () => { playSound(); renderPhoto(photoIndex); }));
  next.addEventListener('click', () => {
    playSound();
    if (index === destinations.length - 1) modal.close();
    else render(index + 1);
  });
  modal.addEventListener('close', () => {
    frame.removeAttribute('src');
    opener?.focus();
  });
  modal.addEventListener('click', event => {
    const box = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) modal.close();
  });
  render(0);
});
