// Normalizza i nomi dei canali
function normalizeEPGName(str) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, '')
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/\b(hd|fhd|sd|1080|720|h264|h265|plus|extra|direct|premium)\b/g, '')
    .replace(/(rete\s*4|retequattro)/g, 'rete4')
    .replace(/canale\s*5/g, 'canale5')
    .replace(/italia\s*1/g, 'italia1')
    .replace(/tv\s*8/g, 'tv8')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Carica il dizionario epg-name-map.json
let channelNameMap = {};
let currentEPGEndTime = null; // 🔥

async function loadChannelNameMap() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/winstonsmith934/RaspServerTV/main/backend/epg/epg-name-map.json');
    if (!response.ok) throw new Error('HTTP error! Status: ' + response.status);
    channelNameMap = await response.json();
  } catch (error) {
    console.error('Errore nel caricamento del file epg-name-map.json:', error);
    channelNameMap = {}; 
  }
}

// Converte le date EPG
function parseEPGDate(str) {
  if (!str) return new Date(0);
  const match = str.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?\s*([+-]\d{4})?/);
  if (!match) return new Date(0);
  let dateStr = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6] || '00'}`;
  dateStr += match[7] ? match[7].replace(/(\d{2})(\d{2})/, '$1:$2') : 'Z';
  return new Date(dateStr);
}

// Formatta ora:minuti
function formatHourMinutes(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// Carica la guida EPG
async function loadEPG(channelName) {
  const container = document.getElementById('epg-container');
  container.innerHTML = '';
  const now = new Date();

  const normalizedChannelName = normalizeEPGName(channelName);
  const epgTargetName = channelNameMap[normalizedChannelName] || normalizedChannelName;

  let epgMap = {};
  try {
    const res = await fetch('https://raw.githubusercontent.com/winstonsmith934/RaspServerTV/refs/heads/main/backend/epg/stable-epg-sources.json');
    if (!res.ok) throw new Error('Errore nel fetch epg-sources');
    epgMap = await res.json();
  } catch (err) {
    console.error('EPG sources error:', err);
    container.innerHTML = `<p>Errore nel caricamento delle fonti EPG.</p>`;
    return;
  }

  const currentGroup = window.currentGroup || 'Italy';
  const primaryList = epgMap[currentGroup] || [];
  const fallbackList = Object.values(epgMap).flat().filter(url => !primaryList.includes(url));
  const guideFiles = [...primaryList, ...fallbackList];

  for (const guideFile of guideFiles) {
    try {
      const res = await fetch(guideFile);
      if (!res.ok) continue;
      const xml = new DOMParser().parseFromString(await res.text(), "application/xml");

      const programmes = Array.from(xml.querySelectorAll('programme')).filter(p => {
        const ch = normalizeEPGName(p.getAttribute('channel') || '');
        return ch === epgTargetName;
      });

      if (programmes.length === 0) continue;

      const nowProgram = programmes.find(p => {
        const start = parseEPGDate(p.getAttribute('start'));
        const stop = parseEPGDate(p.getAttribute('stop'));
        return now >= start && now <= stop;
      });

      const nextProgram = programmes.find(p => {
        const start = parseEPGDate(p.getAttribute('start'));
        return start > now;
      });

      let html = '';

      if (nowProgram) {
        const start = parseEPGDate(nowProgram.getAttribute('start'));
        const stop = parseEPGDate(nowProgram.getAttribute('stop'));
        currentEPGEndTime = stop; // 🔥 Memorizza quando finisce il programma
        const title = nowProgram.querySelector('title')?.textContent || 'Nessun titolo';
        const progress = Math.min(100, ((now - start) / (stop - start)) * 100).toFixed(1);

        html += `
          <div class="program" style="background:#1c212869; padding:10px;">
            <span style="font-size:17px;">
              <span style="color:#f9c855;">Now: </span>${title}
              <a href="https://www.google.com/search?q=tv+guide+${encodeURIComponent(channelName)}" target="_blank" style="color:#f9c855; font-size:12px; text-decoration:none; margin-left:5px;">
                <i class="fa-duotone fa-solid fa-arrow-up-right-from-square fa-fade"></i>
              </a>
            </span>
            <div style="display:flex; justify-content:space-between; font-size:12px; padding-top:10px;">
              <div><span style="color:#f9c855"><i class="fa-duotone fa-solid fa-timer"></i></span> ${formatHourMinutes(start)}</div>
              <div>${formatHourMinutes(stop)}</div>
            </div>
            <div class="progress-bar">
              <div class="progress" style="width: ${progress}%"></div>
            </div>
          </div>`;
      } else {
        currentEPGEndTime = null; // Se non trovi programma
      }

      if (nextProgram) {
        const start = parseEPGDate(nextProgram.getAttribute('start'));
        const title = nextProgram.querySelector('title')?.textContent || 'Nessun titolo';
        html += `<div class="program" style="background:#1c2128; padding:10px;">
          <span style="color:#ff6cb8;">${formatHourMinutes(start)} <i class="fa-duotone fa-solid fa-chevrons-right"></i> </span> ${title}</div>`;
      }

      container.innerHTML = html || `<p>Nessun programma disponibile.</p>`;
      container.innerHTML += `<p style="font-size:0px;color:#888;">Fonte: ${new URL(guideFile).hostname}</p>`;
      return;

    } catch (err) {
      console.error(`Errore parsing ${guideFile}:`, err);
    }
  }

  container.innerHTML = `<div style="text-align:center;"><i class="fa-duotone fa-solid fa-circle-info"></i> EPG not found for this channel.</div>`;
}

// 🔥 Controlla ogni 30 secondi se il programma è finito
setInterval(() => {
  const now = new Date();
  if (currentEPGEndTime && now > currentEPGEndTime) {
    console.log("Fine programma raggiunta. Aggiorno EPG...");

    const selectedChannel = document.querySelector('.channel.selected');
    if (selectedChannel) {
      const channelName = selectedChannel.dataset.display;
      if (channelName) {
        loadEPG(channelName); // Ricarica SOLO la guida
      }
    }
  }
}, 60000); // Ogni 60 secondi
