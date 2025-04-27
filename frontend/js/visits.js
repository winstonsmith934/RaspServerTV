// Funzione per caricare il numero di visite
function loadVisits() {
  fetch("https://raw.githubusercontent.com/JonathanSanfilippo/RaspServerTV/refs/heads/main/backend/info/visits.json")
    .then(res => res.json())
    .then(data => {
      const raw = data.visits;
      const formatted = formatNumber(raw);
      const el = document.getElementById("contatore");
      if (el) {
        el.innerText = formatted;
        pulseAnimation(el); // Effetto animazione e cambio colore Nord
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

// Funzione per effetto animazione e cambio colore Nord
function pulseAnimation(element) {
  element.style.transition = "transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55), color 0.5s ease";
  element.style.transform = "scale(1.2)";
  element.style.color = getRandomNordColor();

  setTimeout(() => {
    element.style.transform = "scale(1)";
  }, 500);
}

// Funzione per ottenere un colore Nord casuale
function getRandomNordColor() {
  const colors = [
    "#bf616a", // Red
    "#d08770", // Orange
    "#ebcb8b", // Yellow
    "#a3be8c", // Green
    "#b48ead"  // Purple
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Avvia subito il caricamento
loadVisits();

// E aggiorna automaticamente ogni 60 secondi
setInterval(loadVisits, 60000); // ogni 1 minuto
