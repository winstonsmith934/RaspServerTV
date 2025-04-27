// Carica numero di visite (dal tuo visits.json)
fetch("https://raw.githubusercontent.com/JonathanSanfilippo/RaspServerTV/refs/heads/main/backend/info/visits.json")
  .then(res => res.json())
  .then(data => {
    const rawVisits = data.visits;
    animateCount("contatore", rawVisits, true); // Formatta le visite
  })
  .catch(err => {
    console.error("Errore caricamento visite:", err);
    document.getElementById("contatore").innerText = "Errore";
  });

// Funzione per animare il numero delle visite
function animateCount(id, target, formatNumber) {
  const el = document.getElementById(id);
  if (!el) return;

  let start = 0;
  const duration = 800;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(progress * target);

    if (formatNumber) {
      el.innerText = formatVisitNumber(currentValue);
    } else {
      el.innerText = currentValue.toString();
    }

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
