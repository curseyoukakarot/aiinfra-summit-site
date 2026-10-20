# AI INFRA SUMMIT 6 — December 9, 2026

Landing page for AI Infra Summit 6 · The Midway, San Francisco · 9 AM → 5 PM.
Produced by IgniteGTM. Static HTML/CSS/JS — no build step, no framework.

Live at **https://www.aiinfra.live** (GitHub Pages, `main` branch root; custom domain via `CNAME`).

This page is also the **flagship event template**: same layout, components, and
behaviors as the Neocloud Summit page (`curseyoukakarot/neocloud-summit-site`),
with every event-specific choice isolated so the next flagship event is a copy +
content swap.

## Run locally

```bash
python3 -m http.server 8765
# then open http://localhost:8765
```

## Structure

| Path | What it is |
|---|---|
| `index.html` | The landing page |
| `css/style.css` | IgniteGTM design system (shared with the main site and Neocloud — keep in sync, don't edit per event) |
| `css/pages.css` | Shared sub-page components (page hero, detail rows, CTA band, photo sections) |
| `css/event.css` | **Event layer**: the THEME block (colors, fonts, heading style) + event components (`ev-*`) |
| `js/page.js` | Shared behaviors — reveals, nav, scroll progress, cursor, in-view video (needs GSAP + ScrollTrigger from CDN) |
| `js/event.js` | Event extras — lazy-loads the 3D cube, click-to-play YouTube |
| `js/cube-fig.js` + `js/three.min.js` | The live exploding cube in the closing band (edit its CONFIG block for dates/colors) |
| `lab/cube-lab.html` | Standalone tuning tool for the cube |
| `tools/speakers.py` | Regenerates the speaker cards from one list (run after editing speakers or adding headshots) |
| `assets/speakers/` | Speaker headshots, `<slug>.jpg`, square 400×400 |
| `assets/logos/sponsors/`, `assets/logos/media/` | Logos trimmed to their ink bounds (SVG), in the event accent color |
| `assets/events/` | Event photography (hero poster, memories) |
| `fonts/` | Geist + Geist Mono variable fonts |
| `documents/Agenda.pdf` | Agenda PDF linked from the page |

## Page flow (same order as Neocloud Summit)

Hero → 01 Why Attend → 02 Speakers → 03 Key Themes → 04 Programming → 05 Partners →
Media Partners → 06 Memories (+ testimonial/photo wall) → 07 Venue → closing CTA band → footer.

## Making the next flagship event from this template

1. **Theme** — edit only the THEME block at the top of `css/event.css`: `--ev-accent`,
   `--ev-accent-2` (gradient end), `--ev-on-accent`, fonts, `--ev-head-weight`,
   `--ev-head-style` (Neocloud uses `italic` / `900`). The shared design system's
   tokens (`--yellow`, `--grad-bolt`, …) are remapped from it, so buttons, eyebrows,
   stats, focus rings, and the scroll bar all follow.
2. **Copy** — hero, section headings, and facts in `index.html`. Section comments
   (`══════════ 03 · KEY THEMES ══════════`) mark each block.
3. **Speakers** — edit the list in `tools/speakers.py`, drop headshots in
   `assets/speakers/`, run `python3 tools/speakers.py` (it rewrites the block between
   the `speakers:start` / `speakers:end` markers).
4. **Logos** — trim to ink bounds; set each logo's `--h` (optically balanced height:
   roughly `64 / sqrt(width / height)` px, then ×1.7 for the top tier and ×1.4 for the second).
5. **Tracking** — swap the GTM / RB2B / LinkedIn Insight IDs (head, top of body, end of body).
6. **Domain** — `CNAME`, `canonical`, `og:url`, `og:image`, JSON-LD `url`.

## Tracking on this page

Google Tag Manager `GTM-KXLTXKCH`, RB2B `961Y0HDDVPNG`, LinkedIn Insight `9927164`.

## Network dependencies

- GSAP 3.12.5 (jsDelivr) for reveals and nav state.
- Hero video streams from Supabase (`studio-reel-web.mp4`, 96 MB — too big for git).
- The highlights reel is a `youtube-nocookie.com` embed, loaded only when the visitor clicks play.
- Three.js is local and is fetched only when the closing band nears the viewport.
