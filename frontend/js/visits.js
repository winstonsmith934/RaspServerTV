// Funzione per caricare e aggiornare il numero di visite
function loadVisits() {
  fetch("https://raw.githubusercontent.com/JonathanSanfilippo/RaspServerTV/main/backend/info/visits.json")
    .then(res => {
      if (!res.ok) throw new Error("Errore rete");
      return res.json();
    })
    .then(data => {
      const visits = parseInt(data.visits, 10);
      if (!isNaN(visits)) {
        animateCount("contatore", visits, true);
      } else {
        console.error("Valore visite non valido:", data.visits);
        document.getElementById("contatore").innerText = "Errore";
      }
    })
    .catch(err => {
      console.error("Errore caricamento visite:", err);
      document.getElementById("contatore").innerText = "Errore";
    });
}

// Primo caricamento immediato
loadVisits();

// Aggiorna automaticamente ogni 2 minuti (120000 ms)
setInterval(loadVisits, 120000);

// Funzione per animare il numero delle visite
function animateCount(id, target, format) {
  const el = document.getElementById(id);
  if (!el) return;

  let start = 0;
  const duration = 800; // Durata animazione in ms
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(progress * target);

    el.innerText = format ? formatVisitNumber(currentValue) : currentValue.toString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Formatta il numero delle visite (es: 1.2K, 2.5M)
function formatVisitNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}
