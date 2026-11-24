(() => {
  const LANTERN_EN_DATA = [
    {
      title: "Sawahlunto City Hall",
      desc: "<p>Sawahlunto City Hall with its signature Minangkabau Gonjong curved roofs stands prominently in the city center. It symbolizes modern municipal governance blending traditional culture with the city's proud renewal from a historic coal enclave to a UNESCO World Heritage cultural capital. Sawahlunto was officially founded as a state mining center on December 1, 1888.</p>"
    },
    {
      title: "Sawahlunto Panoramic Viewpoint",
      desc: "<p>The elevated ridge view reveals Sawahlunto nestled in a fertile valley enclosed by the Bukit Barisan mountains. The prominent \"SAWAHLUNTO\" landmark overlooks the valley, honoring the rebirth of a city that once faced the threat of becoming a deserted \"ghost town\" after coal reserves declined from WWII through the 1970s.</p>"
    },
    {
      title: "Ombilin Coal Basin",
      desc: "<p>The Ombilin coal fields were the industrial foundation of modern Sawahlunto. In 1867, Dutch geologist Ir. Willem Hendrik de Greve mapped rich coal deposits estimated at 200 million tons along the Batang Ombilin river, prompting the construction of roads, steam railways, and mining tunnels cutting across the highlands.</p>"
    },
    {
      title: "Mak Itam Steam Engine at Sawahlunto Station",
      desc: "<p>The legendary \"Mak Itam\" coal locomotive rests on the tracks of Sawahlunto Station. This locomotive operated along the mountain-crossing railway engineered by the Dutch colonial state to transport coal down to Teluk Bayur Port in Padang, built through the grueling labor of prisoner-workers known as \"Orang Rantai\".</p>"
    },
    {
      title: "Bukit Asam Heritage Building & Miner Monument",
      desc: "<p>The historic PT Bukit Asam building with its Dutch colonial clock tower and the towering bronze monument of miners raising their pickaxes honors the endurance of past generations. In the 2000s, community-led heritage revitalization culminated in the 2019 inscription of the Ombilin Coal Mining Heritage of Sawahlunto as a UNESCO World Heritage Site.</p>"
    }
  ];

  const MAP_EN_DATA = [
    {
      type: "CULINARY HERITAGE & HISTORIC APPARATUS MUSEUM",
      name: "Goedang Ransoem Museum Sawahlunto",
      desc: "A massive colonial-era public kitchen established in 1918 exhibiting historic steam-powered cauldrons and large-scale mining canteen equipment.",
      hours: "Tuesday – Sunday: 08:00 AM – 04:00 PM WIB",
      closed: "Monday: Closed (Maintenance Day)"
    },
    {
      type: "HISTORICAL UNDERGROUND TUNNEL MUSEUM",
      name: "Lubang Tambang Soero Site Museum & Infobox",
      desc: "An educational historical site allowing visitors to journey into Sawahlunto's first underground coal shaft opened along the Soegar faultline.",
      hours: "Tuesday – Sunday: 08:00 AM – 04:30 PM WIB",
      closed: "Monday: Closed (Maintenance Day)"
    },
    {
      type: "RAILWAY ROLLING STOCK & MAK ITAM MUSEUM",
      name: "Sawahlunto Railway Museum",
      desc: "A historic 1912 railway depot safeguarding vintage signals, steam rolling stock, and the legendary 'Mak Itam' cogwheel mountain engine.",
      hours: "Tuesday – Sunday: 08:00 AM – 04:00 / 05:00 PM WIB",
      closed: "Monday: Closed (Maintenance Day)"
    },
    {
      type: "FAMILY RECREATION & ZOOLOGICAL PARK",
      name: "Taman Satwa Kandi Wildlife Park",
      desc: "An expansive family recreation park rehabilitated from former coal pits, featuring zoological enclosures, fruit orchards, and calm lakes.",
      hours: "Every Day (Monday – Sunday): 08:00 AM – 05:30 PM WIB",
      closed: "Open Daily"
    },
    {
      type: "HILLTOP SCENIC NATURE VIEWPOINT",
      name: "Puncak Cemara City Viewpoint",
      desc: "An elevated hilltop park showcasing sweeping panoramic vistas of the town center and green ridges across the Sawahlunto valley.",
      hours: "Every Day (Monday – Sunday): 24 Hours",
      closed: "Best visit: 07:00 AM – 09:00 PM WIB"
    },
    {
      type: "NATIONAL GEOPARK NATURAL KARST GEOSITE",
      name: "Batu Runciang Geosite",
      desc: "A natural geological site in the Sawahlunto National Geopark exhibiting prehistoric towering limestone karst formations and rock labyrinths.",
      hours: "Every Day (Monday – Sunday): 24 Hours",
      closed: "Open wilderness area (Recommended: 08:00 AM – 05:00 PM WIB)"
    }
  ];


const INSPECTION_EN_DATA = {
  scroll: {
    title: 'Letter from Father', reg: 'SEALED LETTER REG: SWL-2026-01',
    date: 'Sawahlunto Valley, 14 July 2026', heading: 'A Message from Father, Sastrowardoyo',
    author: 'R.M. Sastrowardoyo (Archive Curator)', bodyHtml: '',
    actionBtnText: 'Finish Reading & Open the Photo Album'
  },
  album: {
    title: 'Photo Album & Ombilin Portraits from the 1890s', reg: 'PHOTOGRAPHIC ARCHIVE REG: SWL-1894-02',
    date: 'Ombilin Photography Studio, September 1892', heading: 'Portraits of the Orang Rantai and the Coal City',
    author: 'Ombilin Mining Photo Archive', actionBtnText: 'Finish Exploring the Photos & Open the Tunnel Map',
    bodyHtml: '<p class="quote-intro">“Faces of quiet endurance beneath the coal dust…”</p><p>This album holds authentic portraits of chained labourers and miners brought from across the Indonesian archipelago. They dug beneath Sawahlunto in near-total darkness to keep the age of steam moving.</p><p>Look closely at the tunnel wall in one photograph. Beside a coal cart is a secret mark pointing to a blueprint of the underground passages.</p><p>The hidden map records emergency ventilation routes designed by the workers who came before.</p>'
  },
  map: {
    title: 'Topographic Map & Underground Tunnel Network', reg: 'UNDERGROUND CARTOGRAPHY REG: SWL-1894-03',
    date: 'Mining Survey Office, May 1893', heading: 'Blueprint of Lubang Mbah Soero & the Coal Cart Tracks',
    author: 'Ombilin Chief Geological Surveyor', actionBtnText: 'Finish Studying the Map & Open the Mining Lantern',
    bodyHtml: '<p class="quote-intro">“Secret lines beneath the Bukit Barisan hills…”</p><p>This canvas shows hundreds of metres of underground mining passages, including coal cart tracks and water collection chambers.</p><p>Passage four has a special circle around it: a corridor with high methane levels that, in this story, requires a special oil lantern protected by a thick brass casing.</p><p>The miner’s lantern in this chest is the next object to examine before continuing your journey.</p>'
  },
  lantern: {
    title: 'Ombilin Miner’s Safety Lantern', reg: 'SAFETY ARTEFACT REG: SWL-1894-04',
    date: 'Ombilin Mechanical Workshop, October 1893', heading: 'A Guiding Flame in the Darkness Underground',
    author: 'Underground Mine Safety Department', actionBtnText: 'Finish Exploring the Lantern & Open the Mak Itam Ticket',
    bodyHtml: '<p class="quote-intro">“Light this lantern, and let it illuminate the history buried beneath the coal dust…”</p><p>This lantern was more than a source of light. Deep in the dark Ombilin tunnels, its brass body and thick glass represented the fragile line between life and death. The Orang Rantai miners watched the small flame for changes that could signal dangerous gas.</p><p>Sawahlunto’s mining story began in 1867, when Dutch geologist Willem Hendrik de Greve identified extensive coal deposits along the Batang Ombilin river. The discovery led the Dutch East Indies government to develop an industrial mining centre and formally establish Sawahlunto on 1 December 1888.</p><p>Railways were built through the Minangkabau hills to carry coal to Teluk Bayur in Padang. Thousands of imprisoned forced labourers, known as Orang Rantai, built and worked this network. Supporting facilities included the Goedang Ransoem communal kitchen and the Lubang Mbah Soero tunnel.</p><p>As coal production declined from World War II through the late 1970s, many residents left and the city faced the threat of abandonment. Efforts to preserve and reuse its industrial heritage culminated in the 2019 UNESCO inscription of the Ombilin Coal Mining Heritage of Sawahlunto.</p><p>Follow the lantern’s light to the final ticket: a Mak Itam steam train pass for the last stage of your journey through this railway heritage.</p>'
  }
};
window.SawahluntoEnglish = { lantern: LANTERN_EN_DATA, map: MAP_EN_DATA, inspection: INSPECTION_EN_DATA };
})();
