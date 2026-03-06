# Mass Attack Simulator

A D&D mass combat simulator -- build your horde, roll the dice. Designed as an offline-capable PWA for use at the table, even without wifi.

## Features

- **Monster Lab** -- Create and customize creature presets with flexible damage formulas (e.g. `2d6+3`, `1d4+1d8+5`), multiple damage types, saving throw bonuses, and toggleable extra damage
- **Attack Simulator** -- Build an army from presets, set quantities, toggle advantage/disadvantage, and simulate mass attacks against a target AC with full damage breakdown by type and group
- **Hidden AC Presets** -- DM sets up labeled AC targets (e.g. "Archer", "Guardian") hidden from players
- **Minion Dashboard** -- Visual HP tracking with health bars, status conditions, click-to-select, mass HP changes, and bulk condition management
- **Saving Throw Simulator** -- Roll saves for selected minions with configurable DC, ability, damage, and conditions for pass/fail (with half-damage shortcut)
- **Save / Load** -- Export/import full app state as JSON to resume sessions later
- **Offline PWA** -- Works fully offline after first visit. Installable on phones and desktops

## Tech Stack

- Next.js (static export)
- TypeScript
- Tailwind CSS
- Recharts

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for Production

```bash
npm run build
```

Outputs a static site to `out/` -- deploy anywhere (Vercel, GitHub Pages, Netlify, etc.).

## Deploy to Vercel

Push to GitHub and connect to [Vercel](https://vercel.com), or:

```bash
npx vercel
```

## Offline Usage

1. Visit the deployed URL once on wifi
2. On mobile, tap "Add to Home Screen" to install as an app
3. Works fully offline after that
