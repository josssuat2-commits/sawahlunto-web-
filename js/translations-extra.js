// Translations shared by the newer dialogs and the PHP letter page.
window.SawahluntoLanguage = () => localStorage.getItem('sawahlunto_lang_pref') === 'en' ? 'en' : 'id';
window.SawahluntoSetLanguage = lang => {
  lang = lang === 'en' ? 'en' : 'id';
  localStorage.setItem('sawahlunto_lang_pref', lang);
  document.documentElement.lang = lang;
  document.dispatchEvent(new CustomEvent('sawahlunto:language', { detail: lang }));
};
window.addEventListener('storage', event => {
  if (event.key === 'sawahlunto_lang_pref') window.SawahluntoSetLanguage(window.SawahluntoLanguage());
});
window.SawahluntoAlbumEnglish = [
  ['Sawahlunto City', 'Panorama of Sawahlunto among green hills', 'Sawahlunto is a historic city in West Sumatra, approximately 95 kilometres northeast of Padang, surrounded by the Bukit Barisan hills. Unlike many towns in West Sumatra that grew through trade or traditional communities, Sawahlunto developed through coal mining in the late nineteenth century. Today its buildings, railway lines, and industrial remains tell the story of the city and the people who shaped it.'],
  ['Traces of Ombilin Industry', 'Archival photograph of the industrial area in Sawahlunto', 'This archival photograph shows an industrial area that formed part of Sawahlunto’s mining history. Its buildings and chimneys recall a time when mining powered everyday life. These industrial traces help us understand how the city has changed over time.'],
  ['Coal Silos', 'Coal silos in Sawahlunto', 'The silos are distinctive landmarks in Sawahlunto’s industrial landscape. These storage structures recall the connections between mining, processing, and transporting coal. They reveal how industry shaped the city’s appearance and spaces.'],
  ['Goedang Ransoem Museum', 'Goedang Ransoem Museum in Sawahlunto', 'Goedang Ransoem was a large public kitchen serving mine workers. Its surviving cooking equipment and facilities reveal everyday life behind the mining industry. Today the museum introduces visitors to Sawahlunto’s history of food and labour.'],
  ['Soero Mine Tunnel', 'Soero Mine Tunnel Museum and Infobox', 'The Soero mine tunnel preserves traces of underground coal mining in Sawahlunto. Its passages recall the demanding work of the miners. This site reminds us that the history of coal is also a history of people and their struggle to survive.'],
  ['Railways and Mak Itam', 'Sawahlunto Railway Museum', 'The railway network connected Sawahlunto’s mines with transport routes to the coast. The surviving station and railway collection tell stories of coal transport and the movement of people. Mak Itam remains a powerful reminder of the city’s railway heritage.'],
  ['Remembering the Miners', 'Monument to mine workers with a coal cart', 'The miners’ monument reminds us that industrial progress depended on the labour and lives of many people. Behind coal production are stories of hard work, hardship, and sacrifice. Understanding Sawahlunto’s heritage also means making room for their stories.'],
  ['Sawahlunto, a Place to Come Home To', 'View of Sawahlunto from Puncak Cemara', 'From above, Sawahlunto appears as a city nestled among valleys and hills. This landscape frames its journey from a mining town to a place of tourism and heritage conservation. Every corner invites us to understand the past while imagining new stories.']
];

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('btnToggleLanguage')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'lang-switch-top-right';
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'btnToggleLanguage';
    button.className = 'btn-lang-toggle';
    button.textContent = 'ID / EN';
    button.setAttribute('aria-label', 'Ganti bahasa / Switch language');
    wrapper.append(button);
    document.body.append(wrapper);
    if (!document.querySelector('script[src^="../js/script.js"]')) {
      button.addEventListener('click', () => {
        window.SawahluntoSetLanguage(window.SawahluntoLanguage() === 'en' ? 'id' : 'en');
      });
    }
  }
  const entries = [
    ['#galleryTitle', 'Galeri Sawahlunto', 'Sawahlunto Gallery'],
    ['#lanternTitle', 'JEJAK SEJARAH SAWAH LUNTO', 'TRACING THE HISTORY OF SAWAHLUNTO'],
    ['#btnCloseScrollModal', 'Kembali', 'Back'],
    ['#btnTicketContinue', 'Lanjut Jelajah', 'Continue Exploring'],
    ['#prototypeMapTitle', 'Jelajahi Peta Sawahlunto', 'Explore the Sawahlunto Map'],
    ['.gallery-footer-close', 'Kembali', 'Back'],
    ['.lantern-prototype-close', '× KEMBALI', '× BACK'],
    ['#lanternPrevious', '← KEMBALI', '← BACK'],
    ['.map-close-button', '× Kembali', '× Back'],
    ['#prototypeMapPhoto1', 'Foto 1', 'Photo 1'],
    ['#prototypeMapPhoto2', 'Foto 2', 'Photo 2'],
    ['#prototypeMapLink', 'Buka di Google Maps ↗', 'Open in Google Maps ↗'],
    ['.map-preview-help', 'Peta memerlukan koneksi internet. Jika tidak tampil, gunakan tautan Google Maps di panel lokasi.', 'The map requires an internet connection. If it does not load, use the Google Maps link in the location panel.'],
    ['#prototypeContinueMap', 'Lanjut Jelajahi Peta →', 'Continue to the Map →'],
    ['#btnTicketLogout', 'Yuk, ke Sawahlunto! →', 'Let’s go to Sawahlunto! →'],
    ['#btnResetQuest', 'Ulangi dari Awal', 'Start Over'],
    ['#actionSubtext', 'Ketuk amplop atau segel untuk membaca surat dari Ayah', 'Tap the envelope or seal to read the letter from Father'],
    ['.page-surat .btn-back-nav span', 'Buku Tamu', 'Guestbook'],
    ['.page-surat .guest-info-badge > span:first-of-type', 'Pengunjung:', 'Visitor:'],
    ['.page-prototype-album .btn-back-nav', '← Kembali ke Peti', '← Back to the Chest'],
    ['.chest-action-group [data-open-album]', 'Buka Album', 'Open Album'],
    ['.chest-action-group [data-open-lantern]', 'Buka Lentera', 'Open Lantern'],
    ['.chest-action-group [data-open-map]', 'Buka Peta', 'Open Map']
  ];
  const aria = [
    ['[data-close-album]', 'Tutup album', 'Close album'],
    ['[data-close-ticket]', 'Tutup tiket', 'Close ticket'],
    ['[data-close-lantern]', 'Tutup lentera', 'Close lantern'],
    ['[data-close-map]', 'Tutup peta', 'Close map'],
    ['#previousPhoto', 'Bagian sebelumnya', 'Previous section'],
    ['#nextPhoto', 'Bagian berikutnya', 'Next section'],
    ['#galleryPagination', 'Pilih bagian album', 'Choose an album section'],
    ['#prototypeMapLocations', 'Pilih lokasi wisata', 'Choose a destination'],
    ['.map-destination-panel', 'Informasi lokasi', 'Location information'],
    ['.map-photo-switch', 'Pilih foto lokasi', 'Choose a location photo'],
    ['#ticketDialog', 'Tiket Kereta Mak Itam', 'Mak Itam Train Ticket'],
    ['#btnCloseScrollInspection, #btnCloseInspection', 'Tutup', 'Close']
  ];
  const letterEnglish = [
    'My child, Sawahlunto teaches us that something once great need not disappear when times change. Sometimes it simply needs to find a new way to remain meaningful.',
    'The same is true of your life away from home. You will face changes, difficulties, and many roads ahead. Yet I hope you always remember where you came from. However far you travel, never forget the stories and places that shaped you.',
    '<strong>However far you wander, there is always a story waiting to welcome you home.</strong>',
    'Before I finish this letter, there is one more thing I want to tell you. Do you still have the chest I gave you before you left?',
    '<strong>Now, I want you to open that chest.</strong> Inside I have kept something that may help you discover more about Sawahlunto and the stories I have not yet had the chance to tell you.',
    'Open it slowly, my child. What lies inside is more than a reminder of the past: it is the beginning of a story still waiting to unfold.',
    '<strong>With love,<br>Father</strong>'
  ];
  const letter = Array.from(document.querySelectorAll('.scroll-letter-text > p')).map((element, index) => ({ element, original: element.innerHTML, english: letterEnglish[index] }));
  const openLetterEnglish = [
    'My child, far from home...',
    'This city may no longer be as busy as it once was, when the rumble of coal trains woke me every morning.',
    'Yet every street corner, stone passage, and breeze in the Sawahlunto valley still holds stories I have not finished telling you.',
    'I have kept this old chest for you.',
    'Inside are traces of the past and beauty waiting for you to rediscover.',
    'Open each object, understand its story, and discover why this place will always be the home you return to.'
  ];
  document.querySelectorAll('.open-letter-text > p').forEach((element, index) => {
    letter.push({ element, original: element.innerHTML, english: openLetterEnglish[index] });
  });
  function apply() {
    const en = window.SawahluntoLanguage() === 'en';
    document.documentElement.lang = en ? 'en' : 'id';
    const languageButton = document.getElementById('btnToggleLanguage');
    if (languageButton) {
      const label = en ? 'Switch to Indonesian' : 'Ganti ke bahasa Inggris';
      languageButton.title = label;
      languageButton.setAttribute('aria-label', label);
    }
    entries.forEach(([selector, id, english]) => document.querySelectorAll(selector).forEach(el => { el.textContent = en ? english : id; }));
    aria.forEach(([selector, id, english]) => document.querySelectorAll(selector).forEach(el => el.setAttribute('aria-label', en ? english : id)));
    letter.forEach(({ element, original, english }) => {
      if (!english) return;
      element.innerHTML = en ? english : original;
    });
  }
  document.addEventListener('sawahlunto:language', apply);
  apply();
});
