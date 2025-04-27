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

// Funzione per caricare utenti online da counter.dev ogni 30 secondi
function updateOnline() {
  fetch("https://counter.dev/api/e100ac04-084d-43b3-a5cc-4081de4392e9.json")
    .then(res => res.json())
    .then(data => {
      const rawOnline = data.current;
      if (typeof rawOnline === 'number') {
        animateCount("online", rawOnline, false); // Numero puro
        pulseAnimation("online"); // Effetto pulse
      }
    })
    .catch(err => {
      console.error("Errore caricamento online:", err);
      const onlineElement = document.getElementById("online");
      if (onlineElement) {
        onlineElement.innerText = "0 users online";
      }
    });
}

updateOnline(); // Primo caricamento
setInterval(updateOnline, 30000); // Aggiorna ogni 30 secondi

// Funzione per animare i numeri (visite e online)
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
      el.innerText = currentValue + (currentValue === 1 ? " user online" : " users online");
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Formatta le visite (es: 1.2K, 2.5M)
function formatVisitNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

// Aggiunge un piccolo effetto "pulse" quando cambia il numero online
function pulseAnimation(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.transition = "transform 0.3s ease-in-out";
  el.style.transform = "scale(1.1)";

  setTimeout(() => {
    el.style.transform = "scale(1)";
  }, 300);
}
