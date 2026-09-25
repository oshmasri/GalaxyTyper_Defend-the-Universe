# 🌌 Galaxy Typer: Defend the Universe (Z-Type Clone)

A fast-paced cosmic space arcade typing shooter game clone inspired by **Z-Type**, built on the **MERN stack** (MongoDB, Express.js, React 19, Node.js) with HTML5 Canvas 2D and procedural Web Audio API.

---

## 🎮 Gameplay & Mechanics

- **Targeting System**: Press the initial character of any inbound hostile vessel to lock on with your tactical laser suite. Your spaceship smoothly pivots and tracks the target.
- **Laser Fire**: Type the remaining characters in sequence to fire plasma bolts and eliminate the ship.
- **Enemies & Sizing**:
  - **Scouts (Amber)**: Agile, swift crafts with short 3-4 letter words.
  - **Cruisers (Cyan)**: Medium warships with 5-7 letter words.
  - **Dreadnoughts (Magenta)**: Heavy capital ships with long 8+ letter words that rupture into mini-mines upon destruction.
- **EMP Smart Bomb**: Keystrokes recharge your EMP capacitor. Detonate with <kbd>SPACE</kbd> or <kbd>ENTER</kbd> (or click the EMP gauge) to trigger a screen-clearing shockwave.
- **Combo Multipliers**: Consecutive hits rack up combos up to **5x Score Multiplier**.
- **Defense Shields**: You start with 3 Shields. Hull breaches occur when enemies cross the baseline defense perimeter. Clear sectors to repair shields.
- **Web Audio API Synth**: High-impact laser sweeps, sub-bass explosions, EMP shockwave sweeps, ambient synthwave arpeggios, and sound toggle without external asset lag.

---

## 🏗️ Architecture (MERN Stack)

- **MongoDB / Mongoose**: Stores high scores, pilot call-signs, WPM, accuracy %, sector reached, and dates. Includes an automatic resilient JSON fallback so it runs out-of-the-box even without a local MongoDB service.
- **Express.js & Node.js**: REST API server providing endpoints:
  - `GET /api/scores` - Top global leaderboard records.
  - `POST /api/scores` - Submit pilot score and receive global rank.
  - `GET /api/words` - Word dictionary categorized by difficulty.
  - `GET /api/health` - Server & database connectivity status.
- **React 19 & Tailwind CSS**: Futuristic sci-fi UI with glowing cyber grids, CRT scanlines, Orbitron typography, modal windows, and live telemetry HUD.
- **HTML5 Canvas 2D Engine**: 60 FPS vector ship rendering, parallax starfields, particle physics explosions, and laser tracking.

---

## 🚀 Quick Start

### 1. Run Everything in One Command
From `GalaxyTyper_Defend-the-Universe-main/`:
```bash
npm run dev
```
This boots both the **Express API** on `http://localhost:5000` and the **Vite Client** on `http://localhost:5173`.

### 2. Run Independently

**Start Backend Server:**
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

**Start Frontend Client:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## ⌨️ Controls

| Key | Action |
| --- | --- |
| <kbd>A</kbd> - <kbd>Z</kbd> | Type matching letters to target and shoot enemies |
| <kbd>SPACE</kbd> / <kbd>ENTER</kbd> | Discharge EMP Smart Bomb (when charged) |
| <kbd>ESC</kbd> | Pause / Resume mission |

---

## 🏆 Leaderboard & Scoring Formula

```
Score = (Word Length × 40 + Wave Bonus) × Combo Multiplier
```
Submit your pilot call-sign upon mission completion to rank on the Global Hall of Fame!
