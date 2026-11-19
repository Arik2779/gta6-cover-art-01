# Vice Panel — GTA-style Cover Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Arik2779/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Arik2779/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn your own photos into a GTA 6-style multi-panel cover poster — bold caption lettering, a Vice City sunset or neon colour grade — and export it as a PNG to share. Everything runs offline in your desktop browser from the static files in `app/`; photos are read on your machine and never uploaded anywhere.

## What it does

- **Three layouts** — Sunset Grid (hero photo on top, two panels below), Neon Strip (three tall panels), Poster Split (one big panel, two stacked).
- **Any photo, any panel** — upload a photo per panel, or press **Fill all** to spread one photo across every panel. Each panel has its own zoom and left/right, up/down crop sliders.
- **Words** — an editable bold caption and sub-caption, drawn with outlined heavy lettering over a title band.
- **Four original colour grades** — Sunset, Neon Nights, Palm Noir, Pastel Vice — each with its own sky, grade wash, band and lettering colours, plus a painted sun, palm fronds, grain and vignette.
- **Fast export** — one click exports a PNG at 1080 × 1080, 1080 × 1350 or 1920 × 1080.
- **Samples included** — two free sample photos under `app/samples/` so you can try it with no photo of your own.

All art, lettering and palettes are original. No Rockstar Games logo, wordmark, official artwork, character or game font is used anywhere.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Pick a layout, add photos to the three panels (or load the samples), type your caption, pick a grade and an export size, and press **Export PNG**.

No build step, no network requests: `app/index.html` and everything it loads are plain files under `app/`.

## Files

- `app/index.html`, `app/style.css` — the editor page
- `app/src/main.js` — wiring: photo slots, picks, export
- `app/src/cover.js` — the multi-panel cover renderer
- `app/src/presets.js` — colour grades, export sizes, panel layouts
- `app/src/shots.js` — fixed scenes for the screenshots
- `app/samples/` — two free sample photos
- `main.ts` — hands the entry in (copies `app/` and `screenshots/`, writes `dossier.json`)
- `screenshots/` — renders of the app and covers it exported

---

Built for the [make.fun GTA 6 Cover Art bounty](https://make.fun/?ref=808mq1jq&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01).
