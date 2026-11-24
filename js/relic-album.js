document.addEventListener('DOMContentLoaded', () => {
  // Foto lokal dan catatan dari materi proyek; prototipe berdasarkan screenshot pengguna.
  let photos = [
    {
      image: '../imge/lentera_foto_2.jpg',
      title: 'Kota Sawahlunto',
      alt: 'Panorama Kota Sawahlunto di antara perbukitan hijau',
      note: 'Kota Sawahlunto adalah salah satu kota bersejarah di Provinsi Sumatera Barat yang terletak sekitar 95 kilometer dari timur laut Kota Padang dan diapit oleh rangkaian perbukitan Bukit Barisan. Berbeda dari daerah-daerah lain di Sumatera Barat yang tumbuh karena perdagangan atau adat tradisional, Sawahlunto muncul dan berkembang berkat industri pertambangan sejak akhir abad ke-19. Dahulu, kota ini menjadi pusat kegiatan tambang batu bara. Kini, bangunan, jalur kereta, dan peninggalan industrinya mengajak kita mengenal kembali perjalanan kota dan orang-orang yang membentuknya.'
    },
    {
      image: '../imge/foto_1.jpeg', title: 'Jejak Industri Ombilin',
      alt: 'Foto arsip kawasan industri dan cerobong di Sawahlunto',
      note: 'Foto arsip ini memperlihatkan kawasan industri yang menjadi bagian dari perjalanan Sawahlunto sebagai kota tambang. Bangunan dan cerobong mengingatkan kita pada masa ketika kegiatan pertambangan menggerakkan kehidupan kota. Jejak industri ini kini menjadi bahan untuk membaca perubahan Sawahlunto dari masa ke masa.'
    },
    {
      image: '../imge/foto_2.jpeg', title: 'Silo Batu Bara',
      alt: 'Bangunan silo batu bara di Sawahlunto',
      note: 'Silo menjadi salah satu penanda lanskap industri Sawahlunto. Bangunan penyimpanan ini mengingatkan pada hubungan antara tambang, pengolahan, dan pengangkutan batu bara. Kehadirannya menunjukkan bagaimana kegiatan industri membentuk wajah dan ruang kota.'
    },
    {
      image: '../imge/Museum Goedang Ransoem_1.jpeg', title: 'Museum Goedang Ransoem',
      alt: 'Museum Goedang Ransoem Sawahlunto',
      note: 'Goedang Ransoem merupakan bekas dapur umum besar yang melayani kebutuhan pekerja tambang. Peralatan masak dan fasilitas yang tersisa memperlihatkan sisi kehidupan sehari-hari di balik industri pertambangan. Kini, tempat ini menjadi ruang untuk mengenal sejarah pangan dan kerja di Sawahlunto.'
    },
    {
      image: '../imge/Museum Situs Lubang Tambang Soero & Infobox_1.jpg', title: 'Lubang Tambang Soero',
      alt: 'Museum Situs Lubang Tambang Soero dan Infobox',
      note: 'Lubang Tambang Soero menyimpan jejak kegiatan pertambangan bawah tanah di Sawahlunto. Lorong-lorong tambang mengingatkan pada beratnya pekerjaan para penambang. Tempat ini mengajak pengunjung memahami bahwa sejarah batu bara juga merupakan sejarah manusia dan perjuangan hidup mereka.'
    },
    {
      image: '../imge/Museum kereta api sawahlunto_1.webp', title: 'Kereta Api dan Mak Itam',
      alt: 'Museum Kereta Api Sawahlunto',
      note: 'Jaringan kereta api menghubungkan kegiatan pertambangan Sawahlunto dengan jalur pengangkutan menuju pesisir. Stasiun dan koleksi kereta yang tersisa menyimpan cerita tentang perjalanan batu bara dan mobilitas penduduk. Mak Itam menjadi salah satu pengingat kuat akan warisan perkeretaapian kota ini.'
    },
    {
      image: '../imge/foto_5.jpg', title: 'Mengenang Para Penambang',
      alt: 'Monumen para pekerja tambang dengan gerobak batu bara',
      note: 'Monumen para penambang mengingatkan bahwa kemajuan industri ditopang oleh tenaga dan kehidupan banyak orang. Di balik produksi batu bara terdapat kisah kerja keras, kesulitan, dan pengorbanan. Mengenali warisan Sawahlunto berarti juga memberi ruang bagi cerita mereka.'
    },
    {
      image: '../imge/Puncak Cemara City_1.jpg', title: 'Sawahlunto, Rumah untuk Pulang',
      alt: 'Pemandangan Sawahlunto dari Puncak Cemara',
      note: 'Dari ketinggian, Sawahlunto terlihat sebagai kota yang tumbuh di antara lembah dan perbukitan. Lanskap ini menjadi latar bagi perjalanan kota dari kawasan tambang menuju ruang wisata dan pelestarian warisan. Setiap sudutnya mengajak kita memahami masa lalu sambil melihat kemungkinan cerita baru.'
    }
  ];
  const additions = [
  {
    "title": "Danau Biru",
    "images": [
      "danau biru (1).jpg",
      "danau biru (2).webp",
      "danau kandi (1).jpg",
      "danau kandi (2).jpg"
    ],
    "note": "Danau Biru merupakan salah satu objek wisata alam yang terletak di daerah Tumpuak Tangah, Kecamatan Talawi, Kota Sawahlunto, Sumatera Barat. Danau ini memiliki keunikan karena terbentuk dari bekas galian tambang batu bara yang sudah tidak beroperasi. Bekas galian tersebut kemudian terisi oleh air hujan dan air tanah hingga membentuk sebuah danau. Seiring berjalannya waktu, kawasan ini dikenal sebagai destinasi wisata karena memiliki warna air yang tampak biru cerah dan menjadi daya tarik tersendiri bagi wisatawan.\n\nDanau Biru memiliki pemandangan alam yang indah dengan air berwarna biru yang berpadu dengan perbukitan, bebatuan, serta pepohonan hijau di sekitarnya. Keindahan panorama tersebut menjadikan tempat ini cocok untuk menikmati suasana alam, bersantai, dan mengabadikan momen melalui fotografi. Selain menawarkan keindahan alam, Danau Biru juga memiliki nilai sejarah karena menjadi salah satu bukti peninggalan aktivitas pertambangan batu bara di Kota Sawahlunto yang kini dimanfaatkan sebagai potensi wisata daerah.",
    "english": [
      "Blue Lake",
      "Danau Biru in Tumpuak Tangah, Talawi, Sawahlunto formed in a disused coal excavation filled by rain and groundwater. Its blue water, surrounding hills, rocks and greenery make it a destination for enjoying nature and photography. The lake also reflects the transformation of the city’s former mining landscape into a tourism resource."
    ]
  },
  {
    "title": "Museum Goedang Ransoem",
    "images": [
      "GUDANG RANSUM (1).jpeg",
      "gudang ransum (2).jpg"
    ],
    "note": "Gudang Ransum atau Museum Goedang Ransoem merupakan salah satu bangunan bersejarah yang terletak di Jalan Abdul Rahman Hakim, Kecamatan Lembah Segar, Kota Sawahlunto, Sumatera Barat. Bangunan ini didirikan pada tahun 1918 pada masa penjajahan Belanda dan awalnya berfungsi sebagai dapur umum untuk menyediakan makanan bagi ribuan pekerja tambang batu bara Ombilin, pasien rumah sakit, serta keluarga pekerja tambang. Dapur umum ini dilengkapi dengan dua gudang besar dan tungku pembakaran (steam generator) yang mampu memasak sekitar 3.900 kilogram beras setiap harinya untuk memenuhi kebutuhan makanan para pekerja tambang.\n\nSaat ini, Gudang Ransum telah dialihfungsikan menjadi museum yang menyimpan berbagai koleksi peninggalan sejarah, seperti periuk nasi berukuran besar, kuali raksasa, tungku pembakaran, peralatan memasak, foto dokumentasi, dan benda-benda yang berkaitan dengan kehidupan pekerja tambang pada masa kolonial. Museum ini diresmikan pada tanggal 17 Desember 2005 dan menjadi salah satu destinasi wisata sejarah di Kota Sawahlunto. Melalui museum ini, pengunjung dapat mengenal lebih jauh kehidupan para pekerja tambang serta perkembangan teknologi dan sistem penyediaan makanan pada masa pertambangan batu bara dahulu.",
    "english": [
      "Goedang Ransoem Museum",
      "Built in 1918, Goedang Ransoem served as a communal kitchen for Ombilin coal miners, hospital patients and workers’ families. Its large warehouses and steam generators could cook around 3,900 kilograms of rice a day. Inaugurated as a museum on 17 December 2005, it preserves large cooking vessels, stoves, utensils and historical photographs documenting daily life and food provision in the mining town."
    ]
  },
  {
    "title": "Puncak Polan",
    "images": [
      "puncak polan (1).jpg",
      "puncak polan (2.jpeg"
    ],
    "note": "Puncak Polan merupakan salah satu objek wisata alam yang terletak di Kecamatan Lembah Segar, Kota Sawahlunto, Sumatera Barat. Tempat ini berada di kawasan perbukitan yang menjadi salah satu titik tertinggi di sekitar pusat Kota Sawahlunto. Nama Puncak Polan berasal dari cerita turun-temurun masyarakat setempat yang menyebutkan bahwa orang pertama yang mencapai puncak tersebut merupakan seorang berkebangsaan Belanda. Salah satu ciri khas tempat ini adalah adanya tulisan besar bertuliskan \"SAWAHLUNTO\" di bagian atas bukit yang dapat terlihat dari kejauhan dan menjadi ikon kota tersebut.\n\nPuncak Polan menawarkan pemandangan Kota Sawahlunto dari ketinggian dengan latar belakang perbukitan yang mengelilingi kawasan kota. Udara yang sejuk dan panorama alam yang indah menjadikan tempat ini cocok untuk menikmati pemandangan, berfoto, serta melakukan kegiatan wisata alam seperti hiking dan camping. Selain itu, Puncak Polan juga dikenal sebagai salah satu lokasi olahraga paralayang karena memiliki kondisi alam yang mendukung aktivitas olahraga udara tersebut. Kawasan ini juga berpotensi dikembangkan",
    "english": [
      "Polan Peak",
      "Puncak Polan is a hilltop destination in Lembah Segar, Sawahlunto, known for its large SAWAHLUNTO sign and views over the city and surrounding hills. Local oral tradition connects its name to a Dutch person who first reached the summit. The area offers opportunities for photography, hiking, camping and paragliding, with potential for agricultural and sports tourism."
    ]
  },
  {
    "title": "Makam Muhammad Yamin",
    "images": [
      "makam-muhammad-yamin (1).jpg",
      "makam muhammad yamin (2).jpg",
      "makan muhammad yamin (3).jpg"
    ],
    "note": "Makam Pahlawan Nasional Prof. Mr. Muhammad Yamin merupakan salah satu objek wisata sejarah yang terletak di Kecamatan Talawi, Kota Sawahlunto, Sumatera Barat. Muhammad Yamin merupakan tokoh nasional yang lahir di Talawi, Sawahlunto, pada 23 Agustus 1903. Beliau dikenal sebagai seorang pahlawan nasional, sastrawan, budayawan, politikus, serta salah satu tokoh yang berperan dalam perumusan dasar negara dan perjuangan Sumpah Pemuda. Makam ini menjadi tempat peristirahatan terakhir beliau dan merupakan bentuk penghormatan atas jasa serta perjuangannya bagi bangsa Indonesia.\n\nKompleks Makam Muhammad Yamin memiliki bangunan dengan ornamen khas Minangkabau yang mencerminkan budaya daerah asalnya. Kawasan ini menjadi salah satu destinasi wisata sejarah dan wisata ziarah yang sering dikunjungi oleh masyarakat, pelajar, mahasiswa, maupun tokoh nasional untuk mengenang jasa-jasa beliau. Selain sebagai tempat berziarah, makam ini juga menjadi sarana edukasi sejarah bagi generasi muda agar lebih mengenal sosok Muhammad Yamin serta memahami peran pentingnya dalam perjalanan sejarah dan perjuangan kemerdekaan Indonesia.",
    "english": [
      "Muhammad Yamin’s Tomb",
      "Located in Talawi, Sawahlunto, this tomb honors national hero Muhammad Yamin, born here on 23 August 1903. A writer, cultural figure and politician, he contributed to the Youth Pledge movement and the formulation of Indonesia’s state principles. The complex features Minangkabau ornamentation and serves as a place of remembrance, pilgrimage and historical education."
    ]
  }
];
  additions[2].note += ' sebagai destinasi agrowisata dan wisata olahraga yang dapat menarik wisatawan serta mendukung perekonomian masyarakat sekitar.';
  photos.push(...additions.map(group => ({
    title: group.title,
    note: group.note,
    images: group.images.map(file => `../imge/${file}`),
    english: [group.english[0], group.english[0], group.english[1]]
  })));
  photos = photos.map(photo => ({ ...photo, images: photo.images || [photo.image] }));
  const modal = document.getElementById('prototypeGallery');
  if (!modal) return;
  const image = document.getElementById('galleryPhoto');
  const title = document.getElementById('galleryPhotoTitle');
  const note = document.getElementById('galleryPhotoNote');
  const zoomButton = document.createElement('button');
  zoomButton.type = 'button';
  zoomButton.className = 'gallery-zoom-trigger';
  zoomButton.setAttribute('aria-label', 'Perbesar foto album');
  image.before(zoomButton);
  zoomButton.append(image);
  const hint = document.createElement('span');
  hint.textContent = 'Perbesar foto ↗';
  zoomButton.append(hint);
  const zoom = document.createElement('dialog');
  zoom.className = 'album-lightbox';
  zoom.setAttribute('aria-label', 'Foto album diperbesar');
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Tutup foto ×';
  const large = document.createElement('img');
  zoom.append(close, large);
  modal.append(zoom);
  zoomButton.addEventListener('click', () => { large.src = image.src; large.alt = image.alt; zoom.showModal(); });
  close.addEventListener('click', () => zoom.close());
  zoom.addEventListener('click', event => { if (event.target === zoom) zoom.close(); });
  zoom.addEventListener('keydown', event => event.stopPropagation());
  zoom.addEventListener('close', event => { event.stopPropagation(); zoomButton.focus(); });
  const previous = document.getElementById('previousPhoto');
  const next = document.getElementById('nextPhoto');
  const pagination = document.getElementById('galleryPagination');
  const count = document.getElementById('galleryPhotoCount');
  const photoControls = document.getElementById('galleryImageControls');
  const previousImage = document.getElementById('previousGalleryImage');
  const nextImage = document.getElementById('nextGalleryImage');
  const imageCount = document.getElementById('galleryImageCount');
  let index = 0;
  let imageIndex = 0;
  let trigger = null;

  const clickSound = new Audio('../sound/button_sound.mp3');
  clickSound.preload = 'auto';
  function sound() {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  }

  let dots = photos.map((photo, photoIndex) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Bagian ${photoIndex + 1}: ${photo.title}`);
    dot.addEventListener('click', () => { sound(); render(photoIndex); });
    pagination.append(dot);
    return dot;
  });

  function renderImage(position) {
    const photo = photos[index];
    const en = window.SawahluntoLanguage?.() === 'en';
    const translated = photo.english || window.SawahluntoAlbumEnglish?.[index];
    imageIndex = Math.max(0, Math.min(photo.images.length - 1, position));
    image.src = photo.images[imageIndex];
    image.alt = photo.images.length > 1
      ? `${en && translated ? translated[0] : photo.title} — ${en ? 'Photo' : 'Foto'} ${imageIndex + 1}`
      : (en && translated ? translated[1] : photo.alt);
    photoControls.hidden = photo.images.length < 2;
    previousImage.disabled = imageIndex === 0;
    nextImage.disabled = imageIndex === photo.images.length - 1;
    previousImage.setAttribute('aria-label', en ? 'Previous photo in this section' : 'Foto sebelumnya dalam bagian ini');
    nextImage.setAttribute('aria-label', en ? 'Next photo in this section' : 'Foto berikutnya dalam bagian ini');
    photoControls.setAttribute('aria-label', en ? 'Photos in this section' : 'Foto dalam bagian ini');
    imageCount.textContent = en ? `Photo ${imageIndex + 1} of ${photo.images.length}` : `Foto ${imageIndex + 1} dari ${photo.images.length}`;
  }

  function render(photoIndex, selectedImage = 0) {
    index = Math.max(0, Math.min(photos.length - 1, photoIndex));
    const en = window.SawahluntoLanguage?.() === 'en';
    const translated = photos[index].english || window.SawahluntoAlbumEnglish?.[index];
    const photo = en && translated ? { ...photos[index], title: translated[0], alt: translated[1], note: translated[2] } : photos[index];
    hint.textContent = en ? 'Enlarge photo ↗' : 'Perbesar foto ↗';
    close.textContent = en ? 'Close photo ×' : 'Tutup foto ×';
    zoomButton.setAttribute('aria-label', en ? 'Enlarge album photo' : 'Perbesar foto album');
    zoom.setAttribute('aria-label', en ? 'Enlarged album photo' : 'Foto album diperbesar');
    dots.forEach((dot, position) => dot.setAttribute('aria-label', en
      ? `Section ${position + 1}: ${photos[position].english?.[0] || window.SawahluntoAlbumEnglish?.[position]?.[0] || photos[position].title}`
      : `Bagian ${position + 1}: ${photos[position].title}`));
    renderImage(selectedImage);
    if (zoom.open) { large.src = image.src; large.alt = image.alt; }
    title.textContent = photo.title;
    note.replaceChildren();
    const sentences = photo.note.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [photo.note];
    for (let i = 0; i < sentences.length; i += 2) {
      const paragraph = document.createElement('span');
      paragraph.className = 'gallery-note-paragraph';
      paragraph.textContent = sentences.slice(i, i + 2).join('').trim();
      note.append(paragraph);
    }
    count.textContent = en ? `Section ${index + 1} of ${photos.length}` : `Bagian ${index + 1} dari ${photos.length}`;
    previous.disabled = index === 0;
    next.disabled = index === photos.length - 1;
    dots.forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === index)));
    modal.querySelector('.prototype-gallery-body').scrollTop = 0;
    document.getElementById('photoCard').scrollTop = 0;
  }

  function openAlbum(button) {
    trigger = button;
    render(0);
    if (!modal.open) modal.showModal();
  }
  window.SawahluntoRelics ??= {};
  window.SawahluntoRelics.album = { open: openAlbum, close: () => modal.close() };
  document.getElementById('prototypeContinueMap')?.addEventListener('click', () => {
    modal.close();
    window.SawahluntoRelics.map.open(document.querySelector('[data-open-map]'));
  });
  document.querySelectorAll('[data-open-album]').forEach(button => {
    button.addEventListener('click', () => { sound(); openAlbum(button); });
  });
  document.querySelectorAll('[data-close-album]').forEach(button => {
    button.addEventListener('click', () => { sound(); modal.close(); });
  });
  modal.addEventListener('close', () => trigger?.focus());
  modal.addEventListener('click', event => {
    const box = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) modal.close();
  });
  previous.addEventListener('click', () => { sound(); render(index - 1); });
  next.addEventListener('click', () => { sound(); render(index + 1); });
  previousImage.addEventListener('click', () => { sound(); renderImage(imageIndex - 1); });
  nextImage.addEventListener('click', () => { sound(); renderImage(imageIndex + 1); });
  photoControls.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      sound();
      renderImage(imageIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  modal.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      sound();
      render(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  document.addEventListener('sawahlunto:language', () => render(index, imageIndex));
  render(0);

});
