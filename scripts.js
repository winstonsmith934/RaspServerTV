

//------------------------------------------------------------------------------------

  document.getElementById("year").textContent = new Date().getFullYear();

  const m3uUrls = [
    'https://raw.githubusercontent.com/JonathanSanfilippo/iptv-auto-cleaner/refs/heads/main/lists/original/original.m3u',
    ''
  ];

  let hls, allChannels = {}, currentGroup = 'UK';
  const player = document.getElementById('player');
  const channelList = document.getElementById('channelList');
  const countrySelector = document.getElementById('countrySelector');
  const searchBox = document.getElementById('searchBox');
  const statusMsg = document.getElementById('statusMessage');
  const channelTitle = document.getElementById('channelTitle');

  function parseM3UData(text, skipFlags = false) {
    const lines = text.split('\n');
    let name = '', logo = '', group = '', url = '';

    lines.forEach((line) => {
      if (line.startsWith('#EXTINF')) {
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        const groupMatch = line.match(/group-title="([^"]+)"/);
        logo = logoMatch ? logoMatch[1] : '';
        group = groupMatch ? groupMatch[1] : 'Other';
        const parts = line.split(',');
        name = parts.length > 1 ? parts.slice(1).join(',').trim() : 'Unnamed';
      } else if (line.startsWith('http')) {
        url = line.trim();
        if (!allChannels[group]) allChannels[group] = [];
        allChannels[group].push({ name, logo, url });
      }
    });

    if (!skipFlags) {
      const countries = Object.keys(allChannels).sort();
      countries.forEach(c => createCountryFlag(c));

      fetch('https://ipinfo.io/json')
        .then(res => res.json())
        .then(ipdata => {
          const ipCountryCode = ipdata.country.toLowerCase();
          const groupName = Object.keys(allChannels).find(
            key => getCountryCode(key) === ipCountryCode
          );
          if (groupName) {
            const defaultBtn = document.querySelector(`[data-country="${groupName}"]`);
            if (defaultBtn) defaultBtn.click();
          }
          const flagUrl = `https://hatscripts.github.io/circle-flags/flags/${ipdata.country.toLowerCase()}.svg`;
          const info = `<a href='https://ipinfo.io/${ipdata.ip}' target='_blank' style='text-decoration: none; color: inherit;'>
            <img src='${flagUrl}' style=' width: 14px; vertical-align:middle;'>
            ${ipdata.country} 
          </a><span style="font-size:14px;">[${ipdata.ip}]</span>`; 
          document.getElementById('locationInfo').innerHTML = info;
        })
        .catch(err => console.warn('IP info not available:', err));
    }
  }

  async function loadAllPlaylists(urls) {
    for (let i = 0; i < urls.length; i++) {
      try {
        const res = await fetch(urls[i]);
        const text = await res.text();
        parseM3UData(text, i < urls.length - 1);
      } catch (err) {
        console.error(`Error loading list ${i + 1}:`, err);
      }
    }
  }

  function playStream(url) {
    if (hls) hls.destroy();
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(player);
     
 // 1. Setup qualità visibili come link
hls.on(Hls.Events.MANIFEST_PARSED, function () {
  const qualityOptions = document.getElementById('qualityOptions');
  if (!qualityOptions) return;

  qualityOptions.innerHTML = ''; // reset

  const autoBtn = document.createElement('span');
  autoBtn.className = 'quality-option active';
  autoBtn.textContent = 'Auto';
  autoBtn.onclick = () => {
    hls.currentLevel = -1;
    updateQualityButtons(-1);
  };
  qualityOptions.appendChild(autoBtn);

  hls.levels.forEach((level, index) => {
    const height = level.height;
    let label = '';

if (height >= 8640) label = '16K';
else if (height >= 4320) label = '8K';
else if (height >= 2880) label = '5K';
else if (height >= 2160) label = '4K';
else if (height >= 1600) label = '1600p';
else if (height >= 1440) label = '2K';
else if (height >= 1280) label = '1280p';
else if (height >= 1080) label = '1080p';
else if (height >= 1024) label = '1024p';
else if (height >= 720)  label = '720p';
else if (height >= 576)  label = '576p';
else if (height >= 480)  label = '480p';
else if (height >= 360)  label = '360p';
else if (height >= 240)  label = '240p';
else if (height >= 144)  label = '144p';
else if (height >= 120)  label = '120p';
else if (height >= 96)   label = '96p';
else label = 'Potato';



    const bitrate = Math.round(level.bitrate / 1000);
    const option = document.createElement('span');
    option.className = 'quality-option';
    option.textContent = `${label}`;
    option.title = `${height}p, ${bitrate} kbps`;
    option.dataset.level = index;

    option.onclick = () => {
      hls.currentLevel = index;
      updateQualityButtons(index);
    };

    qualityOptions.appendChild(option);
  });

  function updateQualityButtons(activeLevel) {
    document.querySelectorAll('.quality-option').forEach(el => {
      el.classList.toggle('active', el.dataset.level == activeLevel || (activeLevel === -1 && !el.dataset.level));
    });
  }
});

// 2. Aggiorna visualizzazione qualità corrente
hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
  const level = hls.levels[data.level];
  const qualityInfo = document.getElementById('qualityInfo');

  if (!level) {
    qualityInfo.textContent = 'Quality: Auto';
    qualityInfo.style.color = '#aaa';
    return;
  }

  const height = level.height;
  let label = '';
  let color = '';

  if (height >= 8640) {
  label = '16K Experimental'; color = '#FF44CC'; // Ultra futuristica
} else if (height >= 4320) {
  label = '8K Ultra HD'; color = '#A144FF';
} else if (height >= 2880) {
  label = '5K UltraWide'; color = '#A166FF'; // iMac 27" etc.
} else if (height >= 2160) {
  label = '4K Ultra HD'; color = '#A144FF';
} else if (height >= 1600) {
  label = 'WQXGA+ 1600p'; color = '#33FFC1'; // Monitor alti
} else if (height >= 1440) {
  label = '2K QHD'; color = '#00FFC3';
} else if (height >= 1280) {
  label = 'HD+ 1280p'; color = '#33FFDD'; // Stream HD migliorato
} else if (height >= 1080) {
  label = 'Full HD'; color = '#00FFCC';
} else if (height >= 1024) {
  label = 'XGA+ 1024p'; color = '#66FFCC'; // Qualità media alta
} else if (height >= 720) {
  label = 'HD Ready'; color = '#5AC8FA';
} else if (height >= 576) {
  label = 'PAL SD 576p'; color = '#f7ce3c'; // Standard europeo
} else if (height >= 480) {
  label = 'SD 480p'; color = '#FADA5A';
} else if (height >= 360) {
  label = 'SD 360p'; color = '#FAAC5A';
} else if (height >= 240) {
  label = 'Low 240p'; color = '#D87B7B';
} else if (height >= 144) {
  label = 'Very Low 144p'; color = '#E05252';
} else if (height >= 120) {
  label = 'Low 120p'; color = '#B0413E';
} else if (height >= 96) {
  label = 'Retro 96p'; color = '#964B00';
} else {
  label = 'Potato Mode'; color = '#C0392B'; // Meme mode
}



  const bitrate = Math.round(level.bitrate / 1000);
  qualityInfo.innerHTML = `<i class="fa-duotone fa-solid fa-signal-stream"></i> ${label} [${height}p, ${bitrate} kbps]`;
  qualityInfo.style.color = color;
});



      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
  player.play();
  statusMsg.textContent = '';

   // Evidenzia il canale che sta effettivamente partendo
  document.querySelectorAll('.channel').forEach(c => c.classList.remove('selected'));
  const selectedChannel = document.querySelector(`.channel[data-url="${url}"]`);
  if (selectedChannel) {
    selectedChannel.classList.add('selected');

    // ✅ SOLO SE PARTE: aggiorna titolo + favicon
    const name = selectedChannel.dataset.display;
    const logo = selectedChannel.dataset.logo;

    document.title = `${name}`;

    const favicon = document.getElementById('dynamic-favicon');
       if (favicon) {
      favicon.href = logo && logo.trim() !== ''
        ? logo
        : 'https://img.icons8.com/office40/512/raspberry-pi.png';
  }
    
  }
});



  hls.on(Hls.Events.ERROR, function (event, data) {
  if (data.fatal) {
  
    // Rimuove l'elemento dalla sidebar
    const failedChannel = document.querySelector(`.channel[data-url="${url}"]`);
    if (failedChannel) {
  failedChannel.classList.add('channel-error');
  failedChannel.style.opacity = 0.3;
  failedChannel.style.pointerEvents = 'none'; // lo disattiva senza eliminarlo
}

    // Mostra messaggio e passa al prossimo
    statusMsg.innerHTML = `<span style=" font-size:20px;"> <i class="fa-duotone fa-solid fa-spinner-third fa-spin"></i><span> loading</span><span>` ;

    const visible = Array.from(document.querySelectorAll('.channel')).filter(el => el.style.display !== 'none');
    const i = visible.findIndex(el => el.dataset.url === url);
    const next = visible[i + 1];
    if (next) {
      updateChannelTitle(next.dataset.display, next.dataset.logo);
      playStream(next.dataset.url);
    } else {
      statusMsg.textContent = "No other channel available.";
    }
  }
});

    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = url;
      player.play();
    } else {
      alert("Your browser does not support HLS.");
    }
  }

  function updateChannelTitle(name, logo) {
    channelTitle.innerHTML = `
      <img src="${logo}" alt="" ><p> ${name}<p/>
      `;
      // Carica l'EPG per il canale attuale
  loadEPG(name); // <-- Passa il nome del canale
 }

  function createChannelElement(name, logo, url) {
    const div = document.createElement('div');
    div.className = 'channel';
    div.dataset.url = url;
    div.dataset.name = name.toLowerCase();
    div.dataset.display = name;
    div.dataset.logo = logo;

    const img = document.createElement('img');
    img.src = logo && logo.trim() !== '' ? logo : 'https://img.icons8.com/office40/512/raspberry-pi.png';
    img.alt = name;
    img.className = 'channel-logo';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    nameSpan.className = 'channel-name';

    div.appendChild(img);
    div.appendChild(nameSpan);

    div.addEventListener('click', () => {
  // Rimuove "selected" da tutti i canali
  document.querySelectorAll('.channel').forEach(c => c.classList.remove('selected'));

  // Aggiunge "selected" solo al canale cliccato
  div.classList.add('selected');

  playStream(url);
  updateChannelTitle(name, logo);
});

    channelList.appendChild(div);
  }

  function getCountryCode(groupName) {
  const map = {
    "uk": "gb", "usa": "us", "canada": "ca", "ireland": "ie", "australia": "au",
    "india": "in", "japan": "jp", "china": "cn", "hong_kong": "hk", "macau": "mo",
    "taiwan": "tw", "north_korea": "kp", "korea": "kr", "denmark": "dk",
    "faroe_islands": "fo", "greenland": "gl", "finland": "fi", "iceland": "is",
    "norway": "no", "sweden": "se", "estonia": "ee", "latvia": "lv", "lithuania": "lt",
    "belgium": "be", "netherlands": "nl", "luxembourg": "lu", "germany": "de",
    "austria": "at", "switzerland": "ch", "poland": "pl", "czech_republic": "cz",
    "slovakia": "sk", "hungary": "hu", "romania": "ro", "moldova": "md", "bulgaria": "bg",
    "france": "fr", "italy": "it", "portugal": "pt", "spain": "es", "russia": "ru",
    "belarus": "by", "ukraine": "ua", "armenia": "am", "azerbaijan": "az", "georgia": "ge",
    "bosnia_and_herzegovina": "ba", "croatia": "hr", "montenegro": "me",
    "north_macedonia": "mk", "serbia": "rs", "slovenia": "si", "albania": "al",
    "kosovo": "xk", "greece": "gr", "cyprus": "cy", "andorra": "ad", "malta": "mt",
    "monaco": "mc", "san_marino": "sm", "iran": "ir", "iraq": "iq", "israel": "il",
    "qatar": "qa", "turkey": "tr", "united_arab_emirates": "ae", "argentina": "ar",
    "costa_rica": "cr", "dominican_republic": "do", "mexico": "mx", "paraguay": "py",
    "peru": "pe", "venezuela": "ve", "brazil": "br", "trinidad": "tt", "chad": "td",
    "somalia": "so", "indonesia": "id", "chile": "cl", "saudi_arabia": "sa",
    "afghanistan": "af", "algeria": "dz", "american_samoa": "as", "angola": "ao",
    "anguilla": "ai", "antarctica": "aq", "antigua_and_barbuda": "ag", "aruba": "aw",
    "bahamas": "bs", "bahrain": "bh", "bangladesh": "bd", "barbados": "bb",
    "belize": "bz", "benin": "bj", "bermuda": "bm", "bhutan": "bt",
    "bolivia_plurinational_state_of": "bo", "bonaire_sint_eustatius_and_saba": "bq",
    "botswana": "bw", "bouvet_island": "bv", "brunei_darussalam": "bn",
    "burkina_faso": "bf", "burundi": "bi", "cabo_verde": "cv", "cambodia": "kh",
    "cameroon": "cm", "cape_verde": "cv", "cayman_islands": "ky",
    "central_african_republic": "cf", "christmas_island": "cx",
    "cocos_keeling_islands": "cc", "colombia": "co", "comoros": "km",
    "congo_democratic_republic_of": "cd", "cook_islands": "ck", "cuba": "cu",
    "curaçao": "cw", "ivory_coast": "ci", "djibouti": "dj", "dominica": "dm",
    "ecuador": "ec", "egypt": "eg", "el_salvador": "sv", "equatorial_guinea": "gq",
    "eritrea": "er", "eswatini": "sz", "ethiopia": "et",
    "falkland_islands_malvinas": "fk", "fiji": "fj",
    "french_polynesia": "pf", "french_southern_territories": "tf",
    "gabon": "ga", "gambia": "gm", "ghana": "gh", "gibraltar": "gi",
    "grenada": "gd", "guadeloupe": "gp", "guam": "gu", "guatemala": "gt",
    "guernsey": "gg", "guinea": "gn", "guinea_bissau": "gw", "guyana": "gy",
    "haiti": "ht", "heard_island_and_mcdonald_islands": "hm", "honduras": "hn",
    "islamic_republic_of_iran": "ir", "isle_of_man": "im", "jamaica": "jm",
    "jersey": "je", "jordan": "jo", "kazakhstan": "kz", "kenya": "ke",
    "kiribati": "ki", "kosovo": "xk", "kuwait": "kw", "kyrgyzstan": "kg",
    "lao_peoples_democratic_republic": "la", "lebanon": "lb", "lesotho": "ls",
    "liberia": "lr", "libya": "ly", "liechtenstein": "li", "madagascar": "mg",
    "malawi": "mw", "malaysia": "my", "maldives": "mv", "mali": "ml",
    "marshall_islands": "mh", "martinique": "mq", "mauritania": "mr",
    "mauritius": "mu", "mayotte": "yt", "federated_states_of_micronesia": "fm",
    "moldova_republic_of": "md", "mongolia": "mn", "montserrat": "ms",
    "morocco": "ma", "mozambique": "mz", "myanmar": "mm", "namibia": "na",
    "nauru": "nr", "nepal": "np", "new_caledonia": "nc", "new_zealand": "nz",
    "nicaragua": "ni", "niger": "ne", "nigeria": "ng", "niue": "nu",
    "norfolk_island": "nf", "northern_mariana_islands": "mp", "oman": "om",
    "pakistan": "pk", "palau": "pw", "palestine_state_of": "ps", "panama": "pa",
    "papua_new_guinea": "pg", "philippines": "ph", "pitcairn": "pn",
    "puerto_rico": "pr", "russian_federation": "ru", "rwanda": "rw",
    "réunion": "re", "saint_barthélemy": "bl", "saint_helena_ascension_and_tristan_da_cunha": "sh",
    "saint_kitts_and_nevis": "kn", "saint_lucia": "lc", "saint_martin_french_part": "mf",
    "saint_pierre_and_miquelon": "pm", "saint_vincent_and_the_grenadines": "vc",
    "samoa": "ws", "sao_tome_and_principe": "st", "senegal": "sn",
    "seychelles": "sc", "sierra_leone": "sl", "singapore": "sg",
    "sint_maarten_dutch_part": "sx", "solomon_islands": "sb",
    "south_africa": "za", "south_georgia_and_the_south_sandwich_islands": "gs",
    "south_sudan": "ss", "sri_lanka": "lk", "sudan": "sd", "suriname": "sr",
    "svalbard_and_jan_mayen": "sj", "syrian_arab_republic": "sy",
    "tajikistan": "tj", "tanzania_united_republic_of": "tz", "thailand": "th",
    "timor_leste": "tl", "togo": "tg", "tokelau": "tk", "tonga": "to",
    "tunisia": "tn", "turkmenistan": "tm", "turks_and_caicos_islands": "tc",
    "tuvalu": "tv", "uganda": "ug", "united_kingdom": "gb",
    "united_states": "us", "united_states_minor_outlying_islands": "um",
    "uruguay": "uy", "uzbekistan": "uz", "vanuatu": "vu",
    "venezuela_bolivarian_republic_of": "ve", "viet_nam": "vn",
    "virgin_islands_british": "vg", "virgin_islands_us": "vi",
    "wallis_and_futuna": "wf", "western_sahara": "eh", "yemen": "ye",
    "zambia": "zm", "zimbabwe": "zw", "åland_islands": "ax"
  };
  const key = groupName.toLowerCase().trim();
  return map[key] || key;
}


  function createCountryFlag(country) {
    const code = getCountryCode(country);
    const wrapper = document.createElement('div');
    wrapper.className = 'flag-wrapper';

    const flag = document.createElement('img');
    flag.className = 'flag';
    flag.src = `https://hatscripts.github.io/circle-flags/flags/${code}.svg`;
    flag.onerror = () => {
      flag.src = 'https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/11113cc80977b7c9417ce4fb349cbd35_low_res_Folder_Common.png';
    };
    flag.title = country;
    flag.dataset.country = country;

    const count = allChannels[country]?.length || 0;
    const label = document.createElement('div');
    label.className = 'flag-label';
    label.textContent = `${country} (${count})`;

    wrapper.appendChild(flag);
    wrapper.appendChild(label);

    wrapper.addEventListener('click', () => {
      document.querySelectorAll('.flag-wrapper').forEach(w => w.classList.remove('selected'));
      wrapper.classList.add('selected');
      loadCountry(country);
    });

    countrySelector.appendChild(wrapper);
  }

  function loadCountry(group) {
    currentGroup = group;
    channelList.innerHTML = '';
    const channels = allChannels[group] || [];
    channels.forEach(ch => createChannelElement(ch.name, ch.logo, ch.url));
    if (channels[0]) {
      updateChannelTitle(channels[0].name, channels[0].logo);
      playStream(channels[0].url);
    }
  }

  function searchChannels() {
    const term = searchBox.value.toLowerCase();
    channelList.innerHTML = '';
    if (term === '') {
      loadCountry(currentGroup);
      return;
    }
    for (const group in allChannels) {
      allChannels[group].forEach(channel => {
        if (channel.name.toLowerCase().includes(term)) {
          createChannelElement(channel.name, channel.logo, channel.url);
        }
      });
    }
  }

  searchBox.addEventListener('input', searchChannels);
  loadAllPlaylists(m3uUrls);



  fetch('https://raw.githubusercontent.com/JonathanSanfilippo/iptv-auto-cleaner/refs/heads/main/lists/info/stats.json')
    .then(res => res.json())
    .then(stats => {
      document.getElementById('updateDate').textContent = `${stats.last_update}`;
      document.getElementById('validCount').textContent = `${stats.valid}`;
      document.getElementById('skippedCount').textContent = `${stats.skipped}`;
      document.getElementById('totalCount').textContent = `${stats.total}`;
    })
    .catch(err => {
      console.warn(" Impossibile caricare stats.json:", err);
      document.getElementById('updateDate').textContent = " Unable to load stats.";
    });
    

// visits -----------------------------------------------------------

fetch("https://raw.githubusercontent.com/JonathanSanfilippo/iptv-auto-cleaner/refs/heads/main/contatore.txt")
  .then(res => res.text())
  .then(data => {
    const raw = parseInt(data.trim());
    const formatted = formatNumber(raw);
    document.getElementById("contatore").innerText = formatted;
  })
  .catch(err => {
    console.error("Errore nel caricamento:", err);
    document.getElementById("contatore").innerText = "Errore";
  });

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}


// testing -----------------------------------------------------------


async function loadEPG(channelName) {
  const guideFiles = ['https://raw.githubusercontent.com/JonathanSanfilippo/iptv-auto-cleaner/refs/heads/main/public/guide.xml']; // metti qui il path al tuo XML
  const container = document.getElementById('epg-container');

  const normalize = str =>
    str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, '') // rimuove accenti
      .replace(/(rete\s*4|retequattro)/g, 'rete4')
      .replace(/canale\s*5/g, 'canale5')
      .replace(/italia\s*1/g, 'italia1')
      .replace(/tv\s*8/g, 'tv8')
      .replace(/hd|plus|\+.*|[^a-z0-9]/g, '')
      .trim();

  const target = normalize(channelName);
  const now = new Date();
  container.innerHTML = ``;

  for (const guideFile of guideFiles) {
    try {
      const res = await fetch(guideFile);
      if (!res.ok) {
        console.warn(`Non trovato: ${guideFile}`);
        continue;
      }

      const xmlText = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");

      const programmes = Array.from(xml.querySelectorAll('programme')).filter(p => {
        const ch = normalize(p.getAttribute('channel') || '');
        return ch === target;
      });

      if (programmes.length === 0) continue;

      let html = '';
      const nowProgram = programmes.find(p => {
        const start = parseEPGDate(p.getAttribute('start'));
        const stop = parseEPGDate(p.getAttribute('stop'));
        return now >= start && now <= stop;
      });

      const nextProgram = programmes.find(p => {
        const start = parseEPGDate(p.getAttribute('start'));
        return start > now;
      });

      if (nowProgram) {
  const start = parseEPGDate(nowProgram.getAttribute('start'));
  const stop = parseEPGDate(nowProgram.getAttribute('stop'));
  const title = nowProgram.querySelector('title')?.textContent || 'Nessun titolo';

  const progress = Math.min(100, ((now - start) / (stop - start)) * 100).toFixed(1);

  html += `
    <div class="program">
      <strong style="color:#f9c855;">Now:</strong> ${title}<br>
      <span style="font-size:12px;">${start.toLocaleTimeString()}</span>
      <div class="progress-bar">
        <div class="progress" style="width: ${progress}%"></div>
      </div>
    </div>`;
}


      if (nextProgram) {
        const start = parseEPGDate(nextProgram.getAttribute('start'));
        const stop = parseEPGDate(nextProgram.getAttribute('stop'));
        const title = nextProgram.querySelector('title')?.textContent || 'Nessun titolo';
        html += `<div class="program"><strong style="color:#f95572;">Next:</strong> ${title}<br><span style="font-size:12px;">${start.toLocaleTimeString()}</span></div>`;
      }

      container.innerHTML += html || `<p>Nessun programma disponibile.</p>`;
      return;

    } catch (err) {
      console.error(`Errore caricamento ${guideFile}:`, err);
    }
  }

  container.innerHTML += `<p>EPG non trovato per questo canale.</p>`;
}

function parseEPGDate(str) {
  if (!str) return new Date(0);
  const match = str.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/);
  return match
    ? new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`)
    : new Date(0);
}


