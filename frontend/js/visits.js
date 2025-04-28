// Funzione per caricare il numero di visite
function loadVisits() {
  fetch("https://raw.githubusercontent.com/JonathanSanfilippo/RaspServerTV/refs/heads/main/backend/info/visits.json")
    .then(res => res.json())
    .then(data => {
      const raw = data.visits;
      const el = document.getElementById("contatore");
      if (el) {
        animateCount(el, raw); // Fa crescere il numero animato
      }
    })
    .catch(err => {
      console.error("Errore nel caricamento:", err);
      const el = document.getElementById("contatore");
      if (el) {
        el.innerText = "Errore";
      }
    });
}

// Funzione per formattare il numero (es: 1.2K, 2.5M)
function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

// Funzione per animare il conteggio da 0 al numero
function animateCount(element, target) {
  const duration = 1000; // Durata 1 secondo
  const start = 0;
  const startTime = performance.now();

  element.style.color = getRandomNordColor(); // Cambia colore subito
  element.style.transition = "color 0.5s ease";

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(progress * target);

    element.innerText = formatNumber(currentValue);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Funzione per ottenere un colore Nord casuale + 3 colori in più
function getRandomNordColor() {
  const colors = [
    "#D2515E", // Red
    "#d08770", // Orange
    "#ebcb8b", // Yellow
    "#a3be8c", // Green
    "#b48ead", // Purple
    "#88c0d0", // Azzurro Nord
    "#5e81ac", // Blu Nord scuro
    "#58a6ff"  // Blu accent
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Avvia subito il caricamento
loadVisits();

// E aggiorna automaticamente ogni 60 secondi
setInterval(loadVisits, 60000); // ogni 1 minuto
