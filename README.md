# Backgammon Move Suggester PWA

Offline-first Backgammon Move Suggester built with Vite + React + TypeScript, TailwindCSS, and shadcn/ui.

## Features
- Manual position setup with fast point editing, bar, and borne-off controls
- Photo scan flow with crop/rotate, AI extraction, and full review/edit screen
- GNU Backgammon engine (WASM) best move suggestion in a Web Worker
- Offline-first PWA (app shell cached) and IndexedDB persistence
- Export/import history + localStorage backup snapshot
- Unit, integration, and e2e tests with CI workflow

## Getting Started
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

### Tests
```bash
npm run test:run
npm run test:e2e
```

## OpenRouter Vision Proxy (Cloudflare Worker)
The app calls `/api/vision` and `/api/models` which are implemented in a Cloudflare Worker.

1. Install Wrangler and authenticate.
2. Set `OPENROUTER_API_KEY` in `worker/wrangler.toml` or via `wrangler secret`.
3. Deploy the worker and route `/api/*` to it.

## GNU Backgammon WASM
This project uses the GNU Backgammon WASM build from `hwatheod/gnubg-web` and the hosted binaries at:
`https://xenon.stanford.edu/~hwatheod/gnubg_web/`

Files are stored in `public/gnubg/`:
- `gnubg.js`
- `gnubg.wasm`
- `gnubg.data`

GNU Backgammon is licensed under the GPL. See the upstream project for full license text.

## Notes
- The app works fully offline except for photo AI scans.
- If the model cannot determine a value, it must be returned as `null` with a reason in `unknowns[]`.
