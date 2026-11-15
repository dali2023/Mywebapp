// Pause Réseaux : affichage du temps du jour, des limites et du statut Pro dans le popup.

const LABELS = {
  "instagram.com": "Instagram",
  "tiktok.com": "TikTok",
  "youtube.com": "YouTube",
  "facebook.com": "Facebook",
  "x.com": "X",
};

function dateKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatMinutes(seconds) {
  return `${Math.round(seconds / 60)} min`;
}

Promise.all([
  chrome.storage.local.get({ usage: {} }),
  chrome.storage.local.get({ settings: { limits: {}, pro: false } }),
]).then(([{ usage }, { settings }]) => {
  const today = usage[dateKey()] || {};
  const total = Object.values(today).reduce((a, b) => a + b, 0);

  document.getElementById("total").textContent = formatMinutes(total);
  document.getElementById("pro-badge").hidden = !settings.pro;

  const list = document.getElementById("sites");
  for (const [site, label] of Object.entries(LABELS)) {
    const limit = settings.limits?.[site] || 0;
    const row = document.createElement("div");
    row.className = "row";
    const name = document.createElement("span");
    name.textContent = label;
    const value = document.createElement("span");
    value.textContent = formatMinutes(today[site] || 0);
    if (limit > 0) {
      const lim = document.createElement("span");
      lim.className = "limit";
      lim.textContent = ` / ${limit} min`;
      value.appendChild(lim);
    }
    row.append(name, value);
    list.appendChild(row);
  }
});
