# LastLap

Concept website for LastLap, an independent last-one-standing race planned for Thakur Village, Mumbai: 6.706 km every hour until one runner remains.

No date, route or entry details are confirmed yet. This is a hype-stage concept, not a live event page.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:4321`. The race clock is at `/clock`. `npm run build` writes a static site to `dist/`.

## How the film works

The page is one continuous film, not a stack of sections. Scroll position drives everything.

| File | Job |
|---|---|
| `src/scripts/film/reel.js` | Every shot: pacing, camera, the light it enters and leaves through, and the sound mix. Edit here first |
| `src/scripts/film/director.js` | Turns scroll position into a frame: camera, light, transitions |
| `src/scripts/film/engine.js` | One WebGL2 pass: depth parallax, lens flare, route, fog, grain. Adapts resolution to the device |
| `src/scripts/film/sound.js` | Live mix of real recordings, with footsteps paced by scroll speed |
| `src/scripts/film/app.js` | The frame loop, words, race counters and start gate |
| `src/scripts/main.js` | Everything that works without the film: clock, form, bib |

**Every cut happens on a light.** Each shot names a light in its image. The camera flies into the outgoing light and out of the incoming one, and the two meet on screen under a lens flare.

**Without the film.** Visitors with reduced motion, no WebGL2 or no JavaScript get a plain stacked page with the same words and images. Data-saver visitors get still frames instead of video.

## Reservations

The form saves nothing by default and tells visitors so. To connect a list, set this at build time:

```bash
PUBLIC_LIST_ENDPOINT=https://your-endpoint.example/subscribe
```

The form sends `POST` with JSON `{ "email": "...", "name": "..." }`, and expects a 2xx response. Add a privacy note before collecting real details.

## Race clock

`/clock` is a full-screen prop and race-night clock. It isn't linked from the site.

| Key | Action |
|---|---|
| Space | Start or pause |
| R | Reset |
| F | Full screen |

## Rebuilding media

Sources aren't in this repository. These need Python with Pillow, NumPy, SciPy and onnxruntime, plus FFmpeg.

| Tool | Makes |
|---|---|
| `tools/build_stills.py` | Graded stills and phone crops |
| `tools/build_depth.py` | Depth maps for parallax |
| `tools/build_route.py` | `route.png`, the route as a texture |
| `tools/build_video.sh` | Seamlessly looping clips for desktop and phone |
| `tools/build_audio.py` | Looping sound stems and footfalls |

To swap in a new photo, change its source in `build_stills.py`, rebuild it and its depth map, then set its light position in `reel.js`.

## Project documents

- [PLAN.md](PLAN.md): concept, decisions and build status
- [PRODUCT.md](PRODUCT.md): event facts and constraints
- [DESIGN.md](DESIGN.md): visual and motion rules
- [SHOOT-PLAN.md](SHOOT-PLAN.md): the one-evening night shoot
- [CREDITS.md](CREDITS.md): media sources and licences

Built with Astro, WebGL2 and Lenis.
