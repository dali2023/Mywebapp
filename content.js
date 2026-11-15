// Pause Réseaux : script de contenu.
// Envoie un signal toutes les 5 secondes tant que l'onglet est visible et la fenêtre a le focus.
// N'accède à aucun contenu de la page.

const TICK_MS = 5000;

setInterval(() => {
  if (document.visibilityState === "visible" && document.hasFocus()) {
    chrome.runtime.sendMessage({ type: "tick" }).catch(() => {});
  }
}, TICK_MS);
