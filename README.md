# LastLap

Concept website for LastLap, an independent last-one-standing race planned for Thakur Village, Mumbai: 6.706 km every hour until one runner remains.

No date, route or entry details are confirmed yet. This is a hype-stage concept, not a live event page.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:4321`. The race clock is at `/clock`.

```bash
npm run build
```

Static output goes to `dist/`.

## Missing photos in a fresh clone

Five placeholder photos are deliberately kept out of this public repository, because they show other organisers' events. Those sections appear on a dark background until replacements are added. See [CREDITS.md](CREDITS.md).

## Race clock

`/clock` is a full-screen prop and race-night clock. It isn't linked from the site.

| Key | Action |
|---|---|
| Space | Start or pause |
| R | Reset |
| F | Full screen |

## Email list

The form saves nothing by default and tells visitors so. To connect a list, set this at build time:

```bash
PUBLIC_LIST_ENDPOINT=https://your-endpoint.example/subscribe
```

The form sends `POST` with JSON `{ "email": "..." }`, and expects a 2xx response. Add a privacy note before collecting real addresses.

## Media tools

`tools/media.py` grades photographs and `tools/mobile-crops.py` makes the phone crops. Both need Python with Pillow and NumPy.

## Project documents

- [PLAN.md](PLAN.md): concept, decisions and build status
- [PRODUCT.md](PRODUCT.md): event facts and constraints
- [DESIGN.md](DESIGN.md): visual and motion rules
- [SHOOT-PLAN.md](SHOOT-PLAN.md): the one-evening night shoot
- [CREDITS.md](CREDITS.md): media sources and licences

Built with Astro, GSAP and Lenis.
