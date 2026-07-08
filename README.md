# 🪲 Trash Armour

A tiny browser roguelite. You are a bug. Scavenge trash before the timer runs out, forge it into armour and weapons, and fight through three bosses — The Old Boot, The Sprayer, and The Exterminator.

**▶ Play it here: https://vulp-ecula.github.io/Trash-Armour/**

## How to play

- **Collect phase** — move with arrow keys / WASD, on-screen buttons, or swipe on touch. Grab 4 pieces of trash before the timer expires. Avoid the spiders: they steal your last item.
- **Fight phase** — turn-based. Attack, Defend (halves the next hit and blocks poison/stun), or spend one-use Specials granted by the trash you collected.
- Each item contributes 🛡 armour, ⚔️ attack, and a unique special ability. Your build is whatever you managed to grab.

## Tech

Plain React 18 (UMD via CDN), no build step — `game.js` is pre-compiled from JSX so the page loads with no in-browser Babel. Deployed automatically to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

Boss balance was tuned via Monte Carlo simulation (20k fights per configuration) to land the final boss at roughly a 35% win rate with strong play.
