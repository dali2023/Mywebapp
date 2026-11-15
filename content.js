// Pause Réseaux : script de contenu (V0.2).
// - Envoie un signal de temps actif toutes les 5 secondes (onglet visible et fenêtre active).
// - Affiche l'écran de limite quotidienne lorsque la limite est atteinte.
// - Affiche un rappel de pause après la durée configurée.
// N'accède à aucun contenu de la page.

const TICK_MS = 5000;
const TICK_SECONDS = TICK_MS / 1000;
const EXTENSION_SECONDS = 600; // prolongation de 10 minutes, une seule fois par jour et par site
const SITES = ["instagram.com", "tiktok.com", "youtube.com", "facebook.com", "x.com"];
const SITE_LABELS = {
  "instagram.com": "Instagram",
  "tiktok.com": "TikTok",
  "youtube.com": "YouTube",
  "facebook.com": "Facebook",
  "x.com": "X",
};

let sessionSeconds = 0;
let overlayVisible = false;
let bannerVisible = false;

function dateKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function currentSite() {
  const host = location.hostname.replace(/^www\./, "");
  return SITES.find((s) => host === s || host.endsWith("." + s)) || null;
}

function isActive() {
  return document.visibilityState === "visible" && document.hasFocus();
}

function el(tag, text, style = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  if (style) node.style.cssText = style;
  return node;
}

function button(label, onClick, primary = true) {
  const b = el(
    "button",
    label,
    `margin:8px;padding:12px 20px;border-radius:10px;border:none;font-size:16px;cursor:pointer;` +
      (primary ? "background:#fff;color:#0F766E;" : "background:transparent;color:#fff;border:2px solid #fff;")
  );
  b.addEventListener("click", onClick);
  return b;
}

function showLimitOverlay(site, limitMin, canExtend) {
  if (overlayVisible) return;
  overlayVisible = true;

  const wrap = el(
    "div",
    "",
    "position:fixed;inset:0;z-index:2147483647;background:rgba(15,118,110,0.97);color:#fff;" +
      "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
      "font-family:system-ui,sans-serif;text-align:center;padding:24px;"
  );
  wrap.id = "pause-reseaux-overlay";
  wrap.appendChild(el("div", "Limite atteinte", "font-size:28px;font-weight:700;margin-bottom:12px;"));
  wrap.appendChild(
    el("div", `Vous avez atteint votre limite de ${limitMin} min sur ${SITE_LABELS[site]} aujourd'hui.`,
      "font-size:18px;max-width:420px;margin-bottom:24px;")
  );

  const actions = el("div", "", "display:flex;flex-wrap:wrap;justify-content:center;");
  actions.appendChild(
    button("Quitter ce site", () => {
      if (history.length > 1) history.back();
      else location.href = "about:blank";
    })
  );
  if (canExtend) {
    actions.appendChild(button("Prolonger de 10 min (une fois)", () => extendToday(site), false));
  }
  wrap.appendChild(actions);
  document.documentElement.appendChild(wrap);
}

async function extendToday(site) {
  const { extras = {} } = await chrome.storage.local.get({ extras: {} });
  const today = dateKey();
  extras[today] = extras[today] || {};
  extras[today][site] = (extras[today][site] || 0) + EXTENSION_SECONDS;
  await chrome.storage.local.set({ extras });
  document.getElementById("pause-reseaux-overlay")?.remove();
  overlayVisible = false;
}

function showBreakBanner(minutes) {
  if (bannerVisible) return;
  bannerVisible = true;

  const banner = el(
    "div",
    "",
    "position:fixed;top:16px;right:16px;z-index:2147483647;background:#0F766E;color:#fff;" +
      "padding:14px 18px;border-radius:12px;font-family:system-ui,sans-serif;font-size:15px;" +
      "box-shadow:0 8px 24px rgba(0,0,0,0.2);max-width:320px;"
  );
  banner.id = "pause-reseaux-banner";
  banner.appendChild(el("div", `Pause conseillée : cela fait ${minutes} min sans interruption.`));
  const ok = button("OK", () => {
    banner.remove();
    bannerVisible = false;
  }, false);
  ok.style.margin = "10px 0 0 0";
  banner.appendChild(ok);
  document.documentElement.appendChild(banner);
}

setInterval(async () => {
  const site = currentSite();
  if (!site) return;

  if (!isActive()) {
    sessionSeconds = 0;
    return;
  }

  chrome.runtime.sendMessage({ type: "tick" }).catch(() => {});
  sessionSeconds += TICK_SECONDS;

  try {
    const { settings = {}, usage = {}, extras = {} } = await chrome.storage.local.get({
      settings: {},
      usage: {},
      extras: {},
    });
    const today = dateKey();

    const limitMin = settings.limits?.[site] || 0;
    if (limitMin > 0) {
      const used = usage[today]?.[site] || 0;
      const extra = extras[today]?.[site];
      const allowed = limitMin * 60 + (extra || 0);
      if (used + TICK_SECONDS >= allowed) {
        showLimitOverlay(site, limitMin, extra === undefined);
      }
    }

    const breakSec = (settings.breakMinutes || 20) * 60;
    if (sessionSeconds >= breakSec) {
      showBreakBanner(Math.round(sessionSeconds / 60));
      sessionSeconds = 0;
    }
  } catch (err) {
    console.error("Pause Réseaux :", err);
  }
}, TICK_MS);
