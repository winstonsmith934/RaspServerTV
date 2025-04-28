let currentVisits = null; // Salvo l'ultimo valore mostrato

// Funzione per cercare valore dal contatore counters-free nel DOM
function checkCounterFromDOM() {
  const texts = document.querySelectorAll('text');
  for (let t of texts) {
    if (t.textContent.includes('Total:')) {
      const match = t.textContent.match(/Total:\s*(\d+)/);
      if (match) {
        const total = parseInt(match[1]);
        console.log("[VisitCounter] Caricato da counters-free.net DOM → Visite:", total);
        updateCounter(total);
        return true; // trovato
      }
    }
  }
  return false; // non trovato
}

// Funzione per caricare il numero di visite da GitHub JSON
function loadVisits() {
  if (checkCounterFromDOM()) {
    // Se trovato dal DOM counters-free, non faccio altro
    return;
  }

  // Altrimenti carico dal JSON GitHub
  fetch("https://raw.githubusercontent.com/JonathanSanfilippo/RaspServerTV/refs/heads/main/backend/info/visits.json")
    .then(res => res.json())
    .then(data => {
      const raw = data.visits;
      console.log("[VisitCounter] Caricato da GitHub JSON → Visite:", raw);
      updateCounter(raw);
    })
    .catch(err => {
      console.error("[VisitCounter] Errore nel caricamento JSON GitHub:", err);
    });
}

// Funzione per aggiornare il contatore
function updateCounter(raw) {
  const el = document.getElementById("contatore");
  if (el) {
    if (currentVisits !== raw) { // Confronta col valore attuale
      animateCount(el, currentVisits ?? 0, raw);
      currentVisits = raw;
    }
  }
}

// Funzione per formattare il numero
function formatNumber(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

// Funzione per animare il conteggio con zoom e colore
function animateCount(element, start, target) {
  const duration = 1000;
  const startTime = performance.now();

  element.style.color = getRandomNordColor();
  element.style.transition = "color 0.5s ease, transform 0.5s ease, text-shadow 0.5s ease";
  element.style.transform = "scale(1.3)";
  element.style.textShadow = "0 0 8px rgba(88,166,255,0.7)";

  setTimeout(() => {
    element.style.transform = "scale(1)";
    element.style.textShadow = "none";
  }, 500);

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(start + (target - start) * progress);

    element.innerText = formatNumber(currentValue);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.innerText = formatNumber(target);
    }
  }

  requestAnimationFrame(update);
}

// Funzione per ottenere un colore casuale
function getRandomNordColor() {
  const colors = [
    "#58a6ff" // solo blu accent
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Avvia subito il caricamento, aspettando che il DOM sia pronto
window.addEventListener('load', () => {
  setTimeout(loadVisits, 2000); // aspetta 2s per essere sicuro che counters-free abbia scritto
});

// Aggiorna automaticamente ogni minuto
setInterval(loadVisits, 60000); // ogni 60s
