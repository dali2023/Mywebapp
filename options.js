// Pause Réseaux : réglages, limites et activation de la version Pro.

// À remplacer par l'identifiant du produit créé sur Gumroad.
const GUMROAD_PRODUCT_ID = "REMPLACER_PAR_ID_PRODUIT";

const LABELS = {
  "instagram.com": "Instagram",
  "tiktok.com": "TikTok",
  "youtube.com": "YouTube",
  "facebook.com": "Facebook",
  "x.com": "X",
};

const DEFAULT_SETTINGS = { limits: {}, breakMinutes: 20, pro: false };

async function loadSettings() {
  const { settings } = await chrome.storage.local.get({ settings: DEFAULT_SETTINGS });
  return { ...DEFAULT_SETTINGS, ...settings, limits: { ...(settings.limits || {}) } };
}

async function renderLimits(settings) {
  const container = document.getElementById("limits");
  container.innerHTML = "";
  for (const [site, label] of Object.entries(LABELS)) {
    const field = document.createElement("div");
    field.className = "field";
    const name = document.createElement("span");
    name.textContent = label;
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "1440";
    input.dataset.site = site;
    input.value = settings.limits[site] || 0;
    field.append(name, input);
    container.appendChild(field);
  }
}

async function saveSettings() {
  const settings = await loadSettings();
  for (const input of document.querySelectorAll("#limits input")) {
    settings.limits[input.dataset.site] = Math.max(0, Number(input.value) || 0);
  }
  settings.breakMinutes = Math.max(5, Number(document.getElementById("breakMinutes").value) || 20);
  await chrome.storage.local.set({ settings });
  const status = document.getElementById("saveStatus");
  status.className = "status ok";
  status.textContent = "Réglages enregistrés.";
}

async function verifyLicense(key) {
  if (GUMROAD_PRODUCT_ID.startsWith("REMPLACER")) {
    throw new Error("Produit Gumroad non configuré.");
  }
  const body = new URLSearchParams({ product_id: GUMROAD_PRODUCT_ID, license_key: key });
  const response = await fetch("https://api.gumroad.com/v2/licenses/verify", {
    method: "POST",
    body,
  });
  const data = await response.json();
  return data.success === true && !data.purchase?.refunded && !data.purchase?.chargebacked;
}

async function activatePro() {
  const key = document.getElementById("licenseKey").value.trim();
  const status = document.getElementById("proStatus");
  if (!key) {
    status.className = "status error";
    status.textContent = "Saisissez votre clé de licence.";
    return;
  }
  status.className = "status";
  status.textContent = "Vérification en cours…";
  try {
    const valid = await verifyLicense(key);
    if (!valid) {
      status.className = "status error";
      status.textContent = "Clé invalide ou achat remboursé.";
      return;
    }
    const settings = await loadSettings();
    settings.pro = true;
    await chrome.storage.local.set({ settings });
    status.className = "status ok";
    status.textContent = "Pro activé. Merci !";
  } catch (err) {
    status.className = "status error";
    status.textContent = err.message || "Impossible de vérifier la clé pour le moment.";
  }
}

document.getElementById("save").addEventListener("click", saveSettings);
document.getElementById("activate").addEventListener("click", activatePro);

loadSettings().then((settings) => {
  document.getElementById("breakMinutes").value = settings.breakMinutes;
  renderLimits(settings);
  if (settings.pro) {
    document.getElementById("proStatus").className = "status ok";
    document.getElementById("proStatus").textContent = "Pro est actif sur cet appareil.";
  }
});
