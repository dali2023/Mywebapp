# Pause Réseaux

Extension Chrome qui suit le temps passé sur Instagram, TikTok, YouTube, Facebook et X, directement dans le navigateur.

## État : V0.1 (squelette)

Présent :
- Suivi du temps actif par site (toutes les 5 secondes, onglet visible et fenêtre active).
- Stockage local uniquement (`chrome.storage.local`).
- Popup avec le temps du jour, par site.
- Logo SVG et palette de couleurs (teal `#0F766E`, accent `#5EEAD4`).

À faire (V1, selon le cahier des charges) :
- Limites quotidiennes et écran de pause.
- Rappels de pause (`alarms`, `notifications`).
- Page de bilan hebdomadaire et carte de progression.
- Activation Pro par clé de licence Gumroad.
- Icônes PNG 16, 48 et 128 px (le manifest les référencera une fois exportées depuis `icons/logo.svg`).
- Politique de confidentialité publiée.

## Installation pour les tests

1. Ouvrez `chrome://extensions`.
2. Activez le mode développeur.
3. Cliquez sur « Charger l'extension non empaquetée » et sélectionnez ce dossier.

## Confidentialité

Aucune donnée n'est envoyée à un serveur. Les permissions sont limitées aux cinq sites listés.
