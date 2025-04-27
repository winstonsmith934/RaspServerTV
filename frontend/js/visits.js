fetch("https://raw.githubusercontent.com/JonathanSanfilippo/RaspServerTV/refs/heads/main/backend/info/visits.json")
  .then(res => res.json())
  .then(data => {
    const rawVisits = data.visits;
    const rawOnline = data.online;

    // Anima i numeri
    animateCount("contatore", rawVisits, true); // true = formatta con K/M
    animateCount("online", rawOnline, false);   // false = numero puro + testo
  })
  .catch(err => {
    console.error("Errore nel caricamento:", err);
    document.getElementById("contatore").innerText = "Errore";

    const onlineElement = document.getElementById("online");
    if (onlineElement) {
      onlineElement.innerText = "Errore";
    }
  });

function animateCount(id, target, formatNumber) {
  const el = document.getElementById(id);
  if (!el) return;

  let start = 0;
  const duration = 800; // durata animazione in ms
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

function formatVisitNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}
