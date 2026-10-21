# The Dark Protocol: Harry Potter Cyber & Arithmancy Module

> **Official Competition Platform · Coder's Cup 2026**  
> An immersive, full-stack cybersecurity and arithmancy escape-room application featuring an animated 3D physical Grimoire, cinematic AI voice narration, interactive 7-gate roadmap, synchronized master competition timer, and multi-round CTF challenges.

---

## 🏛️ Architecture Overview

The system is split into a modern decoupled architecture:

* **Frontend (`frontend/`)**: Built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, **Motion (Framer Motion)**, and **D3.js**.
  * Dynamic 3D physical book rendering with gilded deckle page edges and brass clasps.
  * Cinematic Harry Potter audio narration player with acoustic synthesis fallback.
  * Wand cursor sparkle particle system.
  * Live dashboard, house standings, Pensieve archives, and terminal breach interface.
  * Reverse proxy rewrites automatically routing `/api/*` requests to the Node.js backend.
* **Backend (`backend/`)**: Built with **Node.js**, **Express**, and **TypeScript**.
  * Authoritative master competition timer controller with drift alignment and admin freeze capabilities.
  * Cryptographic team authentication with `scrypt` hashing and timing-safe comparisons.
  * ElevenLabs Voice AI proxy engine with SHA-256 audio buffer caching and formant synthesis fallback.
  * Round 7 *Final Breach* cryptographic gate validator.
  * Overseer admin sanctuary controls and live event logging.

---

## 🚀 Quick Start

### 1. Prerequisites
* **Node.js** v20+ or v22+
* **npm** v10+

### 2. Install All Dependencies

```bash
# From the repository root:
npm run install:all
```
*(Or navigate into `frontend` and `backend` separately and run `npm install`)*

### 3. Configure Environment Variables (Optional)

Create `.env` in `backend/` (see `backend/.env.example`):
```env
PORT=5000
ELEVENLABS_API_KEY="" # Optional: If empty, Hogwarts acoustic speech synthesizer activates automatically
```

Create `.env` in `frontend/` (see `frontend/.env.example`):
```env
PORT=3000
BACKEND_URL="http://localhost:5000"
```

### 4. Run Development Servers

```bash
# Run both Backend & Frontend concurrently:
npm run dev
```

* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend:** [http://localhost:5000](http://localhost:5000)

To run them individually in separate terminals:
```bash
# Terminal 1 - Backend:
npm run dev:backend

# Terminal 2 - Frontend:
npm run dev:frontend
```

---

## 🗝️ Default Pre-Registered Squads & Credentials

| Team Username | Password | House | Assigned Vault |
| :--- | :--- | :--- | :--- |
| `phoenix` | `alohomora2026` | Gryffindor | Godric's Vault (Folder Alpha) |
| `dumbledorearmy` | `patronus777` | Gryffindor | Godric's Vault (Folder Alpha) |
| `ravenclaw` | `arithmancy42` | Ravenclaw | Ravenclaw Codex (Folder Beta) |
| `slytherin` | `serpensortia99` | Slytherin | Salazar's Enigma (Folder Gamma) |
| `hufflepuff` | `lumosmaxima` | Hufflepuff | Helga's Cache (Folder Delta) |

### 🛡️ Overseer Admin Sanctuary
* **Shortcut:** Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> or navigate to [http://localhost:3000/#admin](http://localhost:3000/#admin).
* **Master Passkeys:** `dumbledore2026` or `alohomora_admin_2026`
* Features: Freeze/pause all squad clocks simultaneously, add/deduct time, adjust team house points, review live audit logs.

---

## 📦 Directory Structure

```
the-dark-protocol-coders-cup-module-/
├── frontend/                     # Next.js 15 Application
│   ├── public/                   # 3D assets, portraits, grimoire covers
│   │   ├── assets/
│   │   └── src/assets/images/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css       # Midnight & gold design system, 3D book physics
│   │   │   ├── layout.tsx        # Wizarding Google fonts & metadata
│   │   │   └── page.tsx          # Dynamic entry page
│   │   ├── components/           # All 20 UI components
│   │   ├── config/               # Character voice definitions
│   │   ├── data/                 # Ciphers, story scenes, module data
│   │   ├── utils/                # Audio synthesizer & narration engine
│   │   └── types.ts              # TypeScript definitions
│   ├── next.config.ts            # Next.js API proxy & rewrites
│   └── package.json
│
├── backend/                      # Node.js Express API Server
│   ├── src/
│   │   ├── server.ts             # Express REST endpoints & timer controller
│   │   └── teamDatabase.ts       # Team profiles & scrypt cryptographic verification
│   ├── tsconfig.json
│   └── package.json
│
├── package.json                  # Root orchestration scripts
└── README.md
```

---

## 🔒 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status check |
| `POST` | `/api/auth/login` | Team squad authentication |
| `GET` | `/api/auth/verify` | Team session validation |
| `POST` | `/api/auth/logout` | Terminate team session |
| `GET` | `/api/timer/state` | Authoritative 90-minute competition clock |
| `POST` | `/api/admin/timer/action` | Admin clock controls (`pause`, `resume`, `add`, `deduct`, `reset`) |
| `POST` | `/api/admin/login` | High Inquisitor passkey verification |
| `GET` | `/api/admin/teams` | Retrieve all squads and live scores |
| `POST` | `/api/admin/team/update` | Award/deduct team house points |
| `POST` | `/api/round7/verify-signal` | Verify Round 6 escape token |
| `POST` | `/api/round7/override-gate` | Final gate override and escape victory verification |
| `POST` | `/api/tts` | ElevenLabs TTS audio generator with caching & acoustic fallback |
| `GET` | `/api/tts/status` | Voice synthesizer engine diagnostic status |
