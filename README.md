# Pause Réseaux

Extension Chrome qui mesure le temps passé sur Instagram, TikTok, YouTube, Facebook et X, et aide à le réduire.

## Fonctions (V0.2)

- Suivi du temps actif par site (toutes les 5 secondes, onglet visible et fenêtre active).
- Limites quotidiennes par site, avec un écran de pause ; une prolongation de 10 minutes par jour et par site.
- Rappel de pause après une durée configurable (20 minutes par défaut).
- Popup avec le temps du jour et les limites.
- Page de bilan : semaine en cours, graphique, comparaison avec la semaine précédente.
- Version Pro : bilans des semaines précédentes et carte de partage (PNG).
- Activation Pro par clé de licence Gumroad.
- Données stockées uniquement sur l'appareil (voir `PRIVACY.md`).

## Avant publication

1. **Remplacer l'identifiant produit Gumroad** dans `options.js` (constante `GUMROAD_PRODUCT_ID`).
2. **Vérifier le endpoint de licence** `https://api.gumroad.com/v2/licenses/verify` dans la documentation Gumroad en vigueur.
3. **Compléter le contact** dans `PRIVACY.md`.
4. **Tester** sur Chrome et Edge avec au moins deux profils.
5. **Préparer la fiche du Chrome Web Store** : description, captures d'écran, justification des permissions (`storage`, cinq sites, `api.gumroad.com`).

## Installation pour les tests

1. Ouvrez `chrome://extensions`.
2. Activez le mode développeur.
3. Cliquez sur « Charger l'extension non empaquetée » et sélectionnez ce dossier.

## Structure

- `manifest.json` : configuration de l'extension (permissions limitées).
- `background.js` : enregistrement du temps dans le stockage local.
- `content.js` : détection du temps actif, écran de limite et rappel de pause.
- `popup.html` / `popup.js` : popup du jour.
- `options.html` / `options.js` : réglages, limites, activation Pro.
- `report.html` / `report.js` : bilan hebdomadaire et carte de partage.
- `icons/` : logo SVG et icônes PNG générées depuis le SVG.
- `PRIVACY.md` : politique de confidentialité.

## Limites connues

- Seul le navigateur est mesuré ; les applications mobiles ne le sont pas.
- Le suivi n'est pas synchronisé entre appareils.
