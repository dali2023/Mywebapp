// Pause Réseaux : service worker (V0.2).
// Reçoit un signal toutes les 5 secondes lorsque l'onglet est visible et actif,
// puis additionne le temps par jour et par site dans chrome.storage.local.

const TICK_SECONDS = 5;
const RETENTION_DAYS = 120;
const SITES = ["instagram.com", "tiktok.com", "youtube.com", "facebook.com", "x.com"];

function dateKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function siteFromUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return SITES.find((s) => host === s || host.endsWith("." + s)) || null;
  } catch {
    return null;
  }
}

// Supprime les jours plus anciens que la durée de conservation.
function pruneOldDays(usage) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const limit = dateKey(cutoff);
  for (const day of Object.keys(usage)) {
    if (day < limit) delete usage[day];
  }
  return usage;
}

// File d'attente : plusieurs onglets peuvent envoyer des signaux en même temps.
// Les écritures sont enchaînées pour ne perdre aucune seconde.
let queue = Promise.resolve();

function recordTick(site) {
  queue = queue
    .then(async () => {
      const key = dateKey();
      const { usage = {} } = await chrome.storage.local.get({ usage: {} });
      usage[key] = usage[key] || {};
      usage[key][site] = (usage[key][site] || 0) + TICK_SECONDS;
      await chrome.storage.local.set({ usage: pruneOldDays(usage) });
    })
    .catch((err) => console.error("Pause Réseaux :", err));
  return queue;
}

chrome.runtime.onInstalled.addListener(async () => {
  const { settings } = await chrome.storage.local.get({ settings: null });
  if (!settings) {
    await chrome.storage.local.set({
      settings: { limits: {}, breakMinutes: 20, pro: false },
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== "tick") return;
  const site = siteFromUrl(sender.tab?.url || "");
  if (site) recordTick(site);
});
