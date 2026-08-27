# AI Infra Summit — landing page (static HTML)

Static, self-contained HTML version of the AI Infra Summit landing page
(<https://www.aiinfra.live>), converted from the Webflow export
`lab-la-aiinfraconf.webflow`. `index.html` renders identically to the live
Webflow page but depends on **no** Webflow / Cloudinary hosting — every asset
the landing page needs is in this repo.

## Run it locally

Any static file server works. From the repo root:

```bash
python3 -m http.server 8765
```

then open <http://localhost:8765/>. (Opening `index.html` directly via
`file://` also works.)

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | **The landing page** (Infra 5 / May 1 2026 edition). This is the deliverable. |
| `css/` | Webflow-exported CSS: `normalize.css`, `webflow.css`, `lab-la-aiinfraconf.webflow.css` (the Webflow Designer classes). |
| `js/webflow.js` | Webflow runtime (interactions/IX2, forms, dropdowns…). |
| `assets/lazarev/` | The agency's custom design/animation layer (GSAP, ScrollTrigger, Swiper, lazy-load, page transitions). Was hosted on Cloudinary and injected by inline `<head>` scripts. `g.min.{css,js}` are global; `infra6/{d,m}.min.{css,js}` are the desktop/mobile bundles for `index.html`; the other folders belong to the secondary pages. |
| `assets/vendor/` | `jquery-3.5.1.min.js` (required by `webflow.js`) and `finsweet-cmsfilter.js`. |
| `css/custom.css` | **Our customizations** layered on top of the export (currently: the hero background video). Add new styles here, never in the exported/minified files. |
| `images/` | All images: Webflow-exported PNGs (favicon, OG images) **plus** every Cloudinary image the pages use (speaker photos `spt*.avif`, logos `*.svg`, gallery `a*.avif`, `mtl*.avif`, …). |
| `videos/` | The self-hosted videos `index.html` uses (cube/box-line loops, credentials reel). The hero background video streams from Supabase (96 MB — too close to GitHub's 100 MB file limit to commit). |
| `fonts/` | Geist + Geist Mono variable fonts. |
| `documents/Agenda.pdf` | Agenda PDF linked from the page. |
| `401.html`, `404.html`, `infra2.html`, `infra3.html`, `infra4.html`, `infra2-speakers.html`, `call-for-participation.html`, `detail_*.html` | Secondary pages from the export (past editions, speakers, CMS templates). Kept for reference; **not** the deliverable. |
| `.claude/launch.json` | Lets Claude Code start the local server (`python3 -m http.server 8765`). |

## How the page loads (worth knowing before editing)

`index.html` is a Webflow export with a custom layer on top. In `<head>`:

1. Webflow CSS (`css/*.css`) loads normally.
2. An inline script detects desktop vs. mobile (`device = "d" | "m"`) and
   injects `assets/lazarev/infra6/<device>.min.css` and later
   `assets/lazarev/infra6/<device>.min.js`. Mobile devices with a wide screen
   also get `assets/lazarev/g.min.css`.
3. `<main>` starts at `opacity:0` and is revealed once the body gets the
   `is-d` / `is-m` class (10 ms after DOM ready), then GSAP intro animations run.
4. At the bottom: jQuery → `js/webflow.js` → `assets/lazarev/g.min.js` on
   `window.onload`.

Media uses `class="lazy"` + `data-src` (vanilla-lazyload swaps `data-src` →
`src` on scroll). When you add an image/video, follow the same pattern or use a
plain `src`.

## What changed vs. the raw Webflow export

Only what was needed to make the page self-contained; markup and styling are
untouched.

- All `res.cloudinary.com/.../static/<file>` URLs → `images/<file>` /
  `videos/<file>` (relative paths, so it works under a sub-path such as
  GitHub Pages).
- Inline loader vars: `protocol="https://", r="res.cloudinary.com/…/raw/upload/…"`
  → `protocol="", r="assets/lazarev"`; cache-buster `v="?156"` → `v=""`.
- jQuery (Webflow CDN) and the Finsweet CMS-filter entry script (jsDelivr)
  vendored into `assets/vendor/`; `integrity`/`crossorigin` attributes dropped
  (they break `file://`). The Finsweet tag carries
  `fs-attributes-dev="cmsfilter"` so Finsweet's self-detection (which normally
  keys off the CDN URL) still works.
- Four `<link rel="preconnect">` tags to Cloudinary/Webflow removed (nothing
  uses them any more).
- The Webflow lowercase-URL redirect is skipped under `file://` (it would
  redirect a mixed-case local path to nowhere).
- Footer links `/legal/privacy-policy` and `/legal/terms-of-use` now point at
  `https://www.aiinfra.live/legal/…` — those are Webflow CMS pages that are
  not part of the export.
- `assets/lazarev/g.min.js` prefetch hints point at local `.html` files.

## Things that still reach the network (by design)

| What | Why | Change when… |
| --- | --- | --- |
| Google Tag Manager `GTM-KXLTXKCH`, reb2b `961Y0HDDVPNG` | Your analytics. | You want different/no tracking — remove the two `<script>` blocks in `<head>`. |
| `og:image` meta → `cdn.prod.website-files.com/…/opngr5.png` | Social crawlers need an absolute URL. The same file is at `images/opngr5.png`. | You deploy: point it at `https://<your-domain>/images/opngr5.png`. |
| `<link rel="canonical" href="https://www.aiinfra.live">` | SEO canonical. | You deploy under a new domain. |
| JSON-LD `Event.image` (`"image": "images/ftfs1.avif"`) | Was a Cloudinary URL; now relative, resolves against whatever origin serves the page. The other JSON-LD `@id`/`url` values still say `https://www.aiinfra.live/`. | You deploy: make it absolute / update the URLs. |
| YouTube iframe API | The "memories" section embeds a YouTube player. | n/a |
| `@finsweet/attributes-a11y` from jsDelivr | The custom bundle lazy-imports it for keyboard-accessibility niceties. Non-visual. | n/a |
| `@finsweet/attributes-cmscore` + `attributes-animation` from jsDelivr | `assets/vendor/finsweet-cmsfilter.js` lazy-imports these two sub-modules at runtime on every page. On `index.html` nothing uses the CMS filter, so this is non-visual; only `infra2-speakers.html` actually needs it. | You want a zero-CDN page — remove the Finsweet `<script>` from `index.html` (nothing on the landing page uses it). |
| `https://lazarev.kiev.ua/ai-infra/static/…` (2 refs in `index.html`, 16 in secondary pages) | Inherited from the live site, where the host is **already dead** (NXDOMAIN). On `index.html` they sit inside a `display:none` widget (`.c-wcm__strs`) and are never fetched. Left untouched for byte-parity. | Never — or delete the hidden block if you want. |
| Outbound links (Luma, Typeform, LinkedIn, X, Instagram, sponsors) | Links. | Content edits. |
| Secondary pages only: 24 large videos still on Cloudinary (~340 MB) | Kept the repo under 100 MB; those pages aren't the deliverable. | You want them local — same approach as `videos/`. |

## Known follow-ups

- **Newsletter form** (`#wf-form-Subscribe` in the Contact section) is a Webflow
  form. Outside Webflow hosting it has no backend (the exported `webflow.js`
  just shows the fail state); wire it to Formspree/Netlify Forms/your API when
  you get to that section.
- The Webflow `data-wf-site` / `data-wf-page` attributes on `<html>` are kept —
  `js/webflow.js` needs them to initialise interactions.
- **Deploy under an all-lowercase path.** Every page carries Webflow's inline
  "force lowercase URL" redirect; on a case-sensitive host (GitHub Pages) a
  mixed-case repo/sub-path name would redirect visitors to a 404. The planned
  repo name (`aiinfra-summit-site`) and all filenames are lowercase, so this is
  a no-op today.

## About the secondary pages

Webflow exports do **not** include CMS content, so:

- `infra2-speakers.html` renders an empty gallery template ("No items found")
  instead of the speaker cards you see live.
- `detail_infra2-speakers.html`, `detail_legal.html`, `detail_tags.html` are
  unpopulated CMS *templates*.
- `401.html` is Webflow's password-gate page (posts to `/.wf_auth`, pulls a
  lock icon from Webflow's CDN) — inert on a static host.
- `404.html` works as-is (GitHub Pages will serve it as the custom 404).

None of these are linked from `index.html`. They're kept as reference material
and can be deleted without affecting the landing page.
