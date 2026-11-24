// Bahasa Tansi is available only for the two letters and the ticket in the supplied script.
document.addEventListener('DOMContentLoaded', () => {
  const sourceButton = document.getElementById('btnToggleLanguage');
  if (!sourceButton) return;
  const controls = [];
  function addControl(host, target, render, ticketOnly = false) {
    const toolbar = document.createElement('div');
    toolbar.className = 'document-language-toolbar';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-document-language';
    button.setAttribute('aria-controls', target.id);
    toolbar.append(button);
    let close = host.querySelector('.btn-close-scroll, .relic-close-button');
    if (!close && host.matches('.open-letter-content')) {
      close = document.createElement('a');
      close.href = 'surat_page.html';
      close.textContent = '\u00d7';
    }
    if (close) {
      close.classList.add('document-close-button');
      toolbar.append(close);
    }
    host.prepend(toolbar);
    let active = true;
    function update(reset = false) {
      const englishUI = window.SawahluntoLanguage() === 'en';
      button.setAttribute('aria-pressed', String(!active));
      button.textContent = active
        ? (englishUI ? 'Read translation' : 'Lihat terjemahan')
        : (englishUI ? 'Read original' : (ticketOnly ? 'Lihat tiket asli' : 'Baca surat asli'));
      button.title = button.textContent;
      button.setAttribute('aria-label', button.title);
      if (close) close.setAttribute('aria-label', englishUI ? 'Close' : 'Tutup');
      render(active, reset);
    }
    button.addEventListener('click', () => { active = !active; update(); });
    controls.push(() => { if (!ticketOnly) active = false; update(true); });
    update();
  }
  const letters = [
    ['.open-letter-content', '.open-letter-text', 'firstLetterText', [
      'Nak, di ranto...',
      'Kota ini mungkin ndak serame dulu lagi, saat bunyi kereta api batu bara mbangunin aku tiap pagi.',
      'Tapi tiap sudut jalan, lorong batu dan hembusan angin di lembah Salunto ini masih nyimpen cerita yang belum selesai tak sampaiin ma ke.',
      'Bapak sengaja nyimpen sebuah kotak lama ni.',
      'Di dalamnyo ado bekas masa lalu dan rancaknya yang nungguin untuk ke pegang balek.',
      'Bukak ciek-ciek, pahami betul kisahnyo dan temuin alasan ngapain tempat ini selalu jadi roma tempat ke balek.'
    ]],
    ['.scroll-image-wrapper', '.scroll-letter-text', 'secondLetterText', [
      'Nak, dari Salunto kito bisa belajar bahwa sesuatu yang pernah jayo ndak harus ilang pas zaman berubah. Kadang-kadang ia cumak perlu nemuin caro baru untuk tetep berarti.',
      'Bitu juo dengan idup ke di ranto, akan ado banyak perubahan, kesulitan dan jalan yang harus ke tempuh. Namun, Bapak ngarep ke selalu ingek dari mano ke barasal. Sejauh apopun langkah ke membawak ke pigi, jangan pernah ngelupain cerita dan tempat yang membentuk ke.',
      '<strong>Kerna sejauh apo pun ke meranto, selalu ado cerita yang nungguin ke pulang.</strong>',
      "Oh iyo, Nak, sebelum Bapak ngakhiri surat ini, ado ciek hal yang ingin Bapak sampaiin. Ke masih nyimpen kotak yang dulu Bapak ke'i sebelum ke pigi, bukan?",
      '<strong>Sekarang Bapak ingin ke mbukak kotak tu.</strong> Di dalamnyo, Bapak nyimpen sesuatu yang mungkin akan nolong ke memahami lebih banyak tentang Salunto samo kisah-kisah yang belum sempat Bapak ceritoin.',
      'Bukaklah pelan-pelan Nak, sebab apo yang ado di dalamnyo ndak cumak peninggalan jaman dulu, tapi awal cerita yang belum selesai.',
      '<strong>Salam kangen Bapak.</strong>'
    ]]
  ];
  letters.forEach(([hostSelector, textSelector, id, tansi]) => {
    const host = document.querySelector(hostSelector);
    const text = document.querySelector(textSelector);
    if (!host || !text) return;
    text.id = id;
    const paragraphs = Array.from(text.children);
    let base = paragraphs.map(p => p.innerHTML);
    addControl(host, text, (active, reset) => {
      if (active || reset) base = paragraphs.map(p => p.innerHTML);
      paragraphs.forEach((p, index) => { p.innerHTML = active ? tansi[index] : base[index]; });
      // Tansi has no dedicated BCP 47 subtag; identify it as an Indonesian local variety.
      text.lang = active ? 'id' : window.SawahluntoLanguage();
      text.dataset.language = active ? 'tansi' : window.SawahluntoLanguage();
      text.scrollTop = 0;
    });
  });
  const ticket = document.getElementById('ticketDialog');
  const ticketImage = ticket?.querySelector('.ticket-visual');
  if (ticketImage) {
    const artwork = document.createElement('div');
    artwork.className = 'ticket-artwork';
    artwork.id = 'ticketArtwork';
    ticketImage.before(artwork);
    artwork.append(ticketImage);
    const ticketImages = {
      id: '../imge/tiket bahasa indonesia.png',
      tansi: '../imge/tiket Bahasa Tansi.png'
    };
    // Ticket artwork is Indonesian/Tansi; popup controls follow the site's language.
    addControl(ticket, artwork, active => {
      ticketImage.hidden = false;
      ticketImage.setAttribute('src', active ? ticketImages.tansi : ticketImages.id);
      ticketImage.dataset.language = active ? 'tansi' : 'id';
      ticketImage.lang = 'id';
      ticketImage.alt = active ? 'Tiket Pulang Sawahlunto, Bahasa Tansi. No. 0001. 093813931.' : (window.SawahluntoLanguage() === 'en' ? 'Sawahlunto homeward ticket. No. 0001. 093813931.' : 'Tiket Pulang Sawahlunto. No. 0001. 093813931.');
    }, true);
  }
  document.addEventListener('sawahlunto:language', () => controls.forEach(reset => reset()));
});
