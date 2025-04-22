
fetch("https://raw.githubusercontent.com/JonathanSanfilippo/RaspServerTV/refs/heads/main/backend/info/visits.json")
  .then(res => res.json())
  .then(data => {
    const raw = data.visits;
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

