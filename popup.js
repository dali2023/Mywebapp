// Pause Réseaux : affichage du temps du jour dans le popup.

const LABELS = {
  "instagram.com": "Instagram",
  "tiktok.com": "TikTok",
  "youtube.com": "YouTube",
  "facebook.com": "Facebook",
  "x.com": "X"
};

function todayKey() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatMinutes(seconds) {
  return `${Math.round(seconds / 60)} min`;
}

chrome.storage.local.get({ usage: {} }).then(({ usage }) => {
  const today = usage[todayKey()] || {};
  const total = Object.values(today).reduce((a, b) => a + b, 0);

  document.getElementById("total").textContent = formatMinutes(total);

  const list = document.getElementById("sites");
  for (const [site, label] of Object.entries(LABELS)) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<span>${label}</span><span>${formatMinutes(today[site] || 0)}</span>`;
    list.appendChild(row);
  }
});
