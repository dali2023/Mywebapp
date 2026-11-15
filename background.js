// Pause Réseaux : service worker.
// Reçoit des « battements » du content script (un toutes les 5 secondes,
// uniquement quand l'onglet est visible et actif) et les additionne par jour et par site.
// Toutes les données restent dans chrome.storage.local.

const TICK_SECONDS = 5;
const SITES = ["instagram.com", "tiktok.com", "youtube.com", "facebook.com", "x.com"];

function todayKey() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function siteFromUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return SITES.find((s) => host === s || host.endsWith("." + s)) || null;
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== "tick") return;
  const site = siteFromUrl(sender.tab?.url || "");
  if (!site) return;

  const key = todayKey();
  chrome.storage.local.get({ usage: {} }).then(({ usage }) => {
    usage[key] = usage[key] || {};
    usage[key][site] = (usage[key][site] || 0) + TICK_SECONDS;
    return chrome.storage.local.set({ usage });
  });
});
