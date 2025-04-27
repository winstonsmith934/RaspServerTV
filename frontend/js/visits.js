// Funzione per estrarre visite da counter.dev
function fetchVisits() {
  fetch("https://counter.dev/dashboard.html?user=jonalinux&token=B8hsBp6xkxU%3D")
    .then(response => response.text())
    .then(html => {
      // Crea un DOM virtuale per leggere l'HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Cerca il primo <dashboard-counter-visitors>
      const visitorsBlock = doc.querySelector('dashboard-counter-visitors dashboard-number');
      if (visitorsBlock) {
        const visits = parseInt(visitorsBlock.getAttribute('title'), 10);

        // Aggiunge 332
        const totalVisits = visits + 332;

        console.log(`✅ Visite reali: ${visits}`);
        console.log(`✅ Visite finali salvate (aggiunto 332): ${totalVisits}`);

        // Mostra sul sito
        const el = document.getElementById("contatore");
        if (el) {
          el.innerText = formatVisitNumber(totalVisits);
        }
      } else {
        console.error("❌ visits block non trovato!");
      }
    })
    .catch(error => {
      console.error("Errore caricamento visits:", error);
    });
}

// Formatta il numero delle visite
function formatVisitNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

// Avvia il recupero visite
fetchVisits();
setInterval(fetchVisits, 120000); // aggiorna ogni 2 minuti
