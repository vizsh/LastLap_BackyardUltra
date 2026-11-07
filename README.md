# LastLap

Concept website for LastLap, an independent last-one-standing race planned for Thakur Village, Mumbai: 6.706 km every hour, for 24 hours at most. 24 loops is 100 miles.

The date is tentative: 2 January 2027. No start time, route or entry details are confirmed yet. This is a hype-stage concept, not a live event page.

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
| `src/scripts/film/app.js` | The frame loop, words, race counters, the Again lap sheet and the opening choice |
| `src/scripts/main.js` | Everything that works without the film: the countdown, the form and the registration poster |

**Every cut happens on a light.** Each shot names a light in its image. The camera flies into the outgoing light and out of the incoming one, and the two meet on screen under a lens flare.

**The opening is a choice.** Event intro plays the film. Register now goes straight to the form and doesn't download the film unless the visitor scrolls back up into it. Sound stays off unless it's switched on.

**The countdown** counts to `START` in `src/scripts/main.js`. The date is tentative and no start time is set, so it counts to the first minute of 2 January 2027 in Mumbai. Change that one line when the time is decided.

**Without the film.** Visitors with reduced motion, no WebGL2 or no JavaScript get a plain stacked page with the same words and images. Data-saver visitors get still frames instead of video.

## Registration

The section is a poster: the visitor's name stands in the sky of the Last light photograph, behind the runner, as they type it. Before they type, it reads "Not for everyone."

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
| `tools/build_route.py` | `route.png`, the route as a texture, and `lamps.webp`, sharper lamps for phones |
| `tools/build_entry.py` | `last-fg.webp`, the runner, land and sun cut out of the Last light photo for the registration poster |
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
