// Pause Réseaux : bilan hebdomadaire, comparaison et carte de partage (Pro).

const LABELS = {
  "instagram.com": "Instagram",
  "tiktok.com": "TikTok",
  "youtube.com": "YouTube",
  "facebook.com": "Facebook",
  "x.com": "X",
};
const SITES = Object.keys(LABELS);
const DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function dateKey(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Midi évite les effets du changement d'heure.
function daysAgo(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function formatDuration(seconds) {
  const minutes = Math.round(seconds / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} h ${m} min` : `${m} min`;
}

function summarize(usage, offsets) {
  let total = 0;
  const perSite = {};
  const perDay = [];
  for (const n of offsets) {
    const d = daysAgo(n);
    const day = usage[dateKey(d)] || {};
    let dayTotal = 0;
    for (const s of SITES) {
      const v = day[s] || 0;
      dayTotal += v;
      perSite[s] = (perSite[s] || 0) + v;
    }
    total += dayTotal;
    perDay.push({ label: DAY_NAMES[d.getDay()], seconds: dayTotal });
  }
  return { total, perSite, perDay };
}

function comparisonText(current, previous) {
  if (previous.total === 0) return "Pas de données pour la semaine précédente.";
  const diff = previous.total - current.total;
  if (diff > 0) return `${formatDuration(diff)} de moins que la semaine précédente.`;
  if (diff < 0) return `${formatDuration(-diff)} de plus que la semaine précédente.`;
  return "Même temps que la semaine précédente.";
}

function renderSites(container, summary) {
  container.innerHTML = "";
  for (const s of SITES) {
    const row = document.createElement("div");
    row.className = "row";
    const name = document.createElement("span");
    name.textContent = LABELS[s];
    const value = document.createElement("span");
    value.textContent = formatDuration(summary.perSite[s] || 0);
    row.append(name, value);
    container.appendChild(row);
  }
}

function renderChart(container, perDay) {
  const max = Math.max(...perDay.map((d) => d.seconds), 1);
  container.innerHTML = "";
  for (const day of perDay) {
    const wrap = document.createElement("div");
    wrap.className = "bar-wrap";
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${(day.seconds / max) * 100}%`;
    bar.title = formatDuration(day.seconds);
    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = day.label;
    wrap.append(bar, label);
    container.appendChild(wrap);
  }
}

function drawShareCard(current, previous) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0F766E";
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 64px system-ui, sans-serif";
  ctx.fillText("Ma semaine sur les réseaux", 80, 150);

  ctx.font = "bold 150px system-ui, sans-serif";
  ctx.fillText(formatDuration(current.total), 80, 380);

  ctx.font = "44px system-ui, sans-serif";
  ctx.fillStyle = "#CCFBF1";
  ctx.fillText(comparisonText(current, previous), 80, 460);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "40px system-ui, sans-serif";
  let y = 580;
  for (const s of SITES) {
    ctx.fillText(`${LABELS[s]}`, 80, y);
    ctx.fillText(formatDuration(current.perSite[s] || 0), 640, y);
    y += 75;
  }

  ctx.fillStyle = "#5EEAD4";
  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillText("Pause Réseaux", 80, 1000);

  return canvas;
}

async function init() {
  const { settings = { pro: false }, usage = {} } = await chrome.storage.local.get({
    settings: { pro: false },
    usage: {},
  });
  const pro = Boolean(settings.pro);

  const current = summarize(usage, [6, 5, 4, 3, 2, 1, 0]);
  const previous = summarize(usage, [13, 12, 11, 10, 9, 8, 7]);

  document.getElementById("total").textContent = formatDuration(current.total);
  document.getElementById("comparison").textContent = comparisonText(current, previous);
  renderChart(document.getElementById("chart"), current.perDay);
  renderSites(document.getElementById("sites"), current);

  document.getElementById("previousCard").hidden = false;
  if (pro) {
    document.getElementById("previousLocked").hidden = true;
    document.getElementById("previousContent").hidden = false;
    renderSites(document.getElementById("previousSites"), previous);
    const share = document.getElementById("share");
    share.disabled = false;
    share.textContent = "Générer la carte";
    share.addEventListener("click", () => {
      const canvas = drawShareCard(current, previous);
      canvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "pause-reseaux-bilan.png";
        a.click();
        URL.revokeObjectURL(a.href);
      });
    });
  }
}

init();
