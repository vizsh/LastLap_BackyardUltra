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

The section is a poster: the visitor's name stands in the sky of the Last light photograph, behind the runner, as they type it. Before they type, it reads "Not for everyone." **Save my poster** draws a 1080 x 1920 story of it on the visitor's own device: their name behind the runner, their bib and their dare. Phones open the share sheet, and computers download the file.

**Prove it** asks for the visitor's biggest running achievement and answers back, rude first and honest second, then dares them to a number of loops a little past it. The rules and every line are in `src/scripts/dare.js`. Accepting the dare puts it on the poster and sends it with the registration.

### Switching the list on

The form posts to `/api/register`, a Vercel function in `api/`. Until a database is connected it answers 503, and the site says nothing was saved. To turn it on:

1. In the Vercel project, add an Upstash Redis database from the Marketplace (free tier). It sets `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`).
2. Optionally set `FIELD_CAP`, the number of places. With a cap, the page shows how many are taken, the form turns invite-only at `INVITE_ONLY_AT` (85% of the cap unless set), and everyone else joins a waitlist in order.
3. Redeploy.

Each runner gets the next bib number and two one-use invite codes. An invite link is `/?invite=CODE#register`. A repeat registration confirms the place but never shows the invites again, because anyone can type anyone's email. Add a privacy note before collecting real details. `PUBLIC_LIST_ENDPOINT` still overrides the endpoint at build time.

### Race day

From half an hour before `START`, the site asks `/api/live` for the field every 20 seconds. Keep a Google Sheet with columns `name`, `bib` and `out` (the loop a runner failed, blank while running), publish it to the web as CSV, and set its link as `LIVE_SHEET_CSV` in Vercel. Set `RACE_START` there too when the start time is decided. The opening then shows the real loop and how many are left, registration closes, and the field appears with names greying out as runners drop. Add `?live=demo` to any page address to preview it with numbered stand-in runners.

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
