# Thakur Village last-one-standing race: website plan

Status: direction approved (The Long Exposure). Nothing is built. The event is named **LastLap**, with a supplied logo. "एक और" (one more) stays as the rallying line.

---

## 1. What your reference photos are saying

I sampled all 8 photos at pixel level. This is what they have in common:

| Finding | Measured | What it means for the site |
|---|---|---|
| The images are mostly darkness | 50% of pixels are near black, 76% are dark | Black is the main material, not a background choice |
| Red owns the colour | About 36% of pixels are in the red family | One saturated colour carries the page |
| Light comes from real sources | Flares, headlamps, LED clock, festoon bulbs | Nothing glows without a source. No decorative gradients |
| White is cold and small | Neutral light is only 1.5% | Headlamp white is rare and precious |
| Warm amber is secondary | Festoon bulbs and tents, about 5% | Amber means shelter: crew tents, aid, dawn |
| Dusk blue appears once | Photo 6's sky, about 6% | Blue marks the hours around sunrise and sunset |

**The feeling:** it is late, people are exhausted, and they still line up again. The finish arch is the start line. Photo 1 has it literally: "There is no finish."

**What to take:** red-lit smoke, headlamp flare pointing at the camera, the LED clock as the only hard number in the frame, the small crowd in the dark, rain caught in a beam.

**What not to take:** the photos themselves, sponsor arches, any logos or event names in them.

---

## 2. Facts that shape the plan

- **Name conflict.** A [Mumbai Backyard Ultra](https://bigsbackyardultra.com/races/mumbai-backyard-ultra/) already exists, by BigFoot Adventures India. Stay well clear of that name.
- **Independent status.** You chose independent, so the site claims no affiliation, ticket or championship route. It says "last one standing", not "Backyard Ultra". I could not read the official rules page (it returned an error), so I don't know how protected that term is. Check before any public launch.
- **Format.** [6.706 km inside the hour](https://www.wikipedia.com/wiki/Backyard_ultra), repeating. 24 loops is 100 miles. Per [UltraSignup's guide](https://help.ultrasignup.com/hc/en-us/articles/44945078654861), one winner, and no winner if nobody outlasts the field by a full loop. Your own rulebook still has to be written.
- **Place.** [Thakur Village](https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.4everland.io/wiki/Thakur_Village.html) is east of the Western Express Highway, with jogger's parks and a cricket ground. That source says there is one entry and exit from the highway. It is an old Wikipedia copy, so confirm it locally before using it as copy.
- **Not confirmed:** that the township touches the national park, or any leopard story. Keep both off the site unless you can verify them.
- **Your unfair advantage:** almost every backyard race happens in a field or forest. Yours happens among towers, in a township people live in. That is the identity.

---

## 3. The concept: The Long Exposure

**One idea:** the whole site is a single photograph being exposed for 24 hours, and scrolling is time passing.

Point a camera at a night race, leave the shutter open, and every headlamp burns a line of light. The loop gets brighter each hour. As runners drop out, fewer lines are added. By the end, one thin line is still being drawn over a huge glowing ring made by everyone who has already stopped.

That picture is the format of this race. No template can do it, and it has one job: **make someone feel what "one more" costs.**

Why it beats the usual race site: the standard page is a dark hero, countdown, stats row, schedule, FAQ. Here, the numbers are the visuals. Race information sits inside the story rather than in blocks underneath it.

### How the light works

A WebGL scene keeps every frame instead of clearing it, so light really does build up on screen. Each simulated runner is a moving point of light on the loop.

- Scroll down: hours advance, trails build, runners drop out
- Scroll back: the exposure rewinds cleanly (the simulation is seeded, so it replays exactly)
- The loop shape is a placeholder until your course exists, and it is labelled as a simulation
- When the real route is ready, the GPS line drops straight in

### Page rules that keep it disciplined

- **Red means still running.** Once something is out, it cools to ash. Nothing else on the page gets red.
- **One vertical ruler.** Every section sits on the same 00 to 24 hour rail.
- **Numbers have weight.** Counters settle with momentum. They never snap.
- **Phones get one thing at a time.** One number, one line, one action per screen.
- **Type gets tired.** Headlines start wide and strong, then physically narrow through the small hours.

---

## 4. The scroll journey

**Rule for the whole site: one idea per screen, one line of copy per idea.** The story has 5 moments, about 10 screens, and under 120 words in total. The first draft had 8 chapters over 17 screens, which was too much.

| # | Moment | What happens on screen | The only copy | Height |
|---|---|---|---|---|
| 1 | **Shutter** | Pure black. A red LED clock counts down to the next real hour. One headlamp ignites | "एक और" / "One more." | 1 |
| 2 | **The Loop** | The 3D route. See section 4a | "6.706 km. One hour. Again." | 4 |
| 3 | **The Night** | The stacked loops become the long exposure. Hours run on the rail. Lights go out one by one. Sky lifts from ink to amber | "24 loops. 100 miles. It isn't over." | 3 |
| 4 | **Last light** | Two lights. One stops. The other runs one more loop alone | "Last one standing." | 1.5 |
| 5 | **The start list** | The finished photograph, four facts, one email field | See section 4b | 1 |

### 4a. The Loop: the 3D route

This is the centrepiece. It answers the first question any runner has: what am I actually running?

**The look:** a black model of the township at night. The towers are dark shapes with a few lit windows. The only colour is the route, a thin line of Flare red lying on the streets. It should feel like an architect's model photographed in a dark room, not a map.

**The sequence, all driven by scroll:**

| Scroll | Camera | What the visitor sees |
|---|---|---|
| 0 to 20% | Straight down from above | A flat red ring on black. It looks abstract |
| 20 to 35% | Tilts down | The ring is revealed as a real route through real streets. Towers rise out of the dark around it. This is the moment people remember |
| 35 to 75% | Drops to street level and follows one headlamp | The line draws itself ahead of the runner. Towers pass overhead. A kilometre count ticks from 0 to 6.706 in LED type |
| 75 to 90% | Lifts away | The line reaches the start and closes. The runner is back with minutes to spare |
| 90 to 100% | Pulls back wide | A second ring appears above the first, then a third, faster and faster, until 24 rings stand stacked as tall as the towers |

That last shot is the repeat made visible: **a tower of light, built by running in circles.** It hands straight over to The Night, so there is no break between the two moments.

**What it deliberately leaves out:** no zoom buttons, no drag to rotate, no pins, no pop-ups, no elevation chart. Scroll is the only control, which keeps the framing beautiful every time and works well with a thumb. At most 3 or 4 small place labels appear along the way, and only once the course is real.

**How it gets built:**

I checked OpenStreetMap for the area. It has 521 building footprints, 768 road sections, and 28 parks and grounds, including Thakur Stadium and Evershine Dream Park. Only 99 buildings have floor counts and 2 have heights, so the rest are estimated. That's fine for a stylised dark model, but it isn't an accurate survey.

1. A one-off script pulls roads and buildings from OpenStreetMap, keeps only what's near the route, and estimates missing heights
2. It compresses all of that into one small 3D file, with a target of under about 500 KB
3. The route is a single data file. A GPX from a watch or Strava replaces it, and the whole sequence updates
4. Three.js renders it with lit windows, soft bloom on the line and light fog

**Fallbacks:** phones get fewer buildings and no bloom. Very weak devices and reduced-motion users get 5 pre-rendered frames of the same shots, so nobody sees a broken or empty section.

**Two cautions:**

- **The route doesn't exist yet.** A line on real streets looks like an announcement, so in the concept it is labelled "Illustrative route" and it must not go public as fact.
- **Run it past the venue first.** Publishing a race route through residential streets before permissions are in place could cause trouble. Until then, the public version can stop at the abstract ring.

Once you have candidate start points, I can use the same road data to test which real loops come to 6.706 km.

### 4b. The start list: all the information on the site

Four facts and one field. Anything not decided just says so. Saying little looks confident.

| | |
|---|---|
| **Format** | 6.706 km every hour until one runner remains |
| **Where** | Thakur Village, Mumbai |
| **When** | To be announced |
| **Entry** | Opens soon |

Then a single email field: "Put your name down." Below that, one small line: independent event, credits, contact.

No FAQ, schedule or rulebook on this page. When those exist, they go on one quiet second page, so this page stays clean.

### 4c. Small touches worth keeping

Each of these costs the visitor no attention. Together they do most of the work of feeling expensive.

| Feature | What it does | Why it stays |
|---|---|---|
| **The hour** | At the top of every real hour, while someone is on the site, the clock hits zero, a bell rings if sound is on, and a sweep of headlamp light crosses the page | Everyone online sees it at the same moment. It's the race's heartbeat |
| **Live clock** | Always counts to the next hour, never to a fake date | Always true, and it needs no race date |
| **Hour rail** | A thin 00 to 24 line on the edge. It's the progress bar and the menu | Replaces a navigation bar completely |
| **One number** | "8:57 per km." That's the pace needed to finish a loop in the hour, and it sounds easy. A single line in The Loop | The most interesting fact about the format |
| **The mark** | Your LastLap logo. Its brushed ring already reads as a long exposure | Used as supplied, never redrawn |
| **DNF page** | The 404 page reads: "You missed the start. DNF." | A small joke that runners will enjoy |

### 4d. Cut on purpose

| Cut | Why |
|---|---|
| Share-poster generator, initials as lights | Clever, but it adds a whole product. Revisit near launch |
| Stats rows, FAQ, schedule, gallery | This is what ordinary event sites look like |
| Testimonials, sponsors, past results | None exist yet, and fake proof ruins trust |
| Scattered runner thoughts, rain layer | Extra moods dilute the main one |
| Language toggle, chat, merch, blog | Not needed at this stage |
| Interactive map controls | Scroll-only framing always looks better |

### 4e. What makes it read as high end

- **Scarce words.** No exclamation marks, no "join us", no "epic". The voice is calm and a little dry
- **Huge type, lots of darkness.** Empty black is the most expensive thing on the page
- **One motion language.** One easing curve, a small family of durations, everything slightly slower than feels safe
- **One grade.** Every image and clip looks like the same night
- **No visible machinery.** No spinner and no loading percentage. The first frame is the design
- **No invented scarcity.** "Limited places" appears only if it's true
- **Consistency beyond the page.** The share image, favicon and confirmation email all carry the same look and voice

### Later, when entries open

The email field becomes Register, with no redesign. Live race data could drive the same scene, but that's out of scope now.

### Skipping and accessibility

- "Skip to the details" link is always available, and the rail is a real jump menu
- Reduced motion: no scrubbing, finished exposure as a still image, normal page
- Works without WebGL: pre-rendered stills per chapter
- All copy is real HTML, so it can be read and indexed

---

## 5. Colour

Strategy: **one colour commits, at page scale.** Whole sections are drenched red-black, not accents on a grey site. Base values come from your photos. The bright values are tuned up from those samples because a screen needs more punch than an averaged photo.

| Token | Hex | Comes from | Job |
|---|---|---|---|
| Ink | `#070304` | Measured, 31% of pixels | Main ground. Warm black, never pure |
| Oxblood | `#3C1011` | Measured, 23% | Smoke-lit fields, section washes |
| Flare | `#FF3B2B` | Tuned from measured `#CA2222` | Anything still alive: runners, clock, main action |
| Ember | `#90272A` | Measured | Fading trails, cooling state |
| Headlamp | `#F1F3F5` | Tuned from measured `#B4B6B6` | Text and the hottest core of light |
| Sodium | `#F4A63A` | Tuned from measured `#C9612B` | Tents, shelter, dawn. Also Mumbai's street lamps |
| Monsoon | `#243040` | Measured | Pre-dawn sky |
| Dusk | `#8FA3BF` | Tuned from measured `#667A9B` | Secondary text in blue hours |

Contrast checked: Headlamp on Ink is 18.4:1, Headlamp on Oxblood 14.8:1, Sodium on Ink 10.1:1, Dusk on Ink 8:1, Flare on Ink 5.8:1, Flare on Oxblood 4.6:1. All pass for text. Buttons use Ink text on Flare (5.8:1).

---

## 6. Typography

The skill's default suggestion was Bebas Neue, the most common sports-site font. I rejected it.

| Role | Face | Why |
|---|---|---|
| Display and body | **[Anek](https://github.com/EkType/Anek)** (Latin + Devanagari) | Made by Ek Type, a Mumbai foundry. Hindi and English match. It has a width axis, so headlines can really narrow through the night. Open licence |
| Race data | **Doto** | Dot-matrix type for the LED clock and counters. Close to race clocks and Mumbai's platform boards |

Both are on npm under the open font licence. I still need to confirm Anek's exact width range in the browser. Hindi is used for short, strong moments, with body copy in English. A native speaker should check it.

---

## 7. Images and footage

Nothing licensed shows runners at night in Thakur Village, so no stock can be the hero. **The light simulation carries the site, and it needs no photos at all.** Footage supports it, graded heavily into the palette so different sources look like one night.

With the site cut down to 5 moments, code and the 3D model now carry almost everything. Footage is optional seasoning, so we may use only 2 or 3 clips.

### Layer by layer

| Slot | Best source | Options found | Treatment |
|---|---|---|---|
| Hero and all race scenes | **Made in code** | Not needed | WebGL light trails, smoke, flare bloom |
| Highway to township | Pexels video | [Aerial Indian highway at night](https://www.pexels.com/video/aerial-view-of-indian-highway-at-night-38876735/), [Foggy night traffic on an Indian highway](https://www.pexels.com/video/foggy-urban-night-traffic-on-indian-highway-35196607/), [Night traffic on Indian roads](https://www.pexels.com/video/dynamic-night-traffic-on-urban-indian-roads-30207865/) | Slowed, red-graded, grain |
| Mumbai texture | Pexels video | [Local train at night](https://www.pexels.com/video/mumbai-local-train-passing-at-night-38979012/), [Station at night](https://www.pexels.com/video/night-view-of-mumbai-local-train-station-38979006/), [Skyline aerial](https://www.pexels.com/video/stunning-aerial-view-of-mumbai-skyline-at-night-40380857/) | Brief inserts in The Night, only if they earn it |
| Runner close-ups | Pexels video | [Runners' feet on a city street](https://www.pexels.com/video/marathon-runners-feet-on-city-street-38667752/), [Woman jogging at night](https://www.pexels.com/video/a-woman-jogging-at-night-in-a-cold-weather-3126161/), [Hikers at night](https://www.pexels.com/video/a-group-of-men-on-a-hiking-trail-at-night-2894897/) | Feet and silhouettes only (see below) |
| Smoke | Pexels and code | [Smoke with tube lighting](https://www.pexels.com/video/dramatic-smoke-effect-with-tube-lighting-30617204/) | Shader smoke first, footage as overlay |
| Towers and streets | **3D model from OpenStreetMap** | 521 footprints and 768 road sections found in the area | Dark massing with lit windows. Needs an OpenStreetMap credit |
| Tree-lined road | Commons | [Borivali National Park road](https://commons.wikimedia.org/wiki/File:Cycling_through_the_Borivali_National_Park.jpg) | Only if credited, see below |
| Grain and sparks | Generated or code | Not needed | Textures only |

I found these by title. I haven't watched each clip, so some may be unsuitable or daylit. Reviewing them is part of phase 1.

### Licence rules

- **[Pexels](https://www.pexels.com/license/):** free, editing allowed, no credit needed. But identifiable people can't imply endorsement. Stock runners must not look like participants, so we use feet, backs and silhouettes only. Nothing from Pexels can go in the logo.
- **Wikimedia Commons:** credit is required, and CC BY-SA means sharing edited versions under the same licence. Avoid for key visuals. The Thakur Village photo is only 500 px wide anyway.
- **Rejected:** Getty, Alamy and Adobe (paid). "Night at Aarey Milk Road" (actually a daytime portrait).
- **AI images:** textures and atmosphere only. Never present generated people or places as real Thakur Village or as a past race. There hasn't been one.

### Your own night shoot, when ready

This will beat any stock. One evening on a phone gets most of it:

1. Long-exposure phone shot of headlamps walking a park loop (night mode or a tripod app)
2. Tower windows from street level at blue hour
3. The highway entry at night, tail lights
4. A jogger's park at 5 am, empty
5. Feet on wet road, low angle, one headlamp
6. Festoon bulbs on a tent
7. A real clock in the dark
8. Local runners at dawn, with their written consent

Get permission from the park, society or venue first. Don't use real flares for a shoot without clearing it locally.

---

## 8. Tech stack

Package versions were checked on npm today.

| Need | Tool | Why |
|---|---|---|
| Site | **Astro 7** | Static HTML with almost no JS by default, so text loads instantly on mobile data |
| Scroll choreography | **GSAP 3.15** (ScrollTrigger, SplitText) | The standard for this work. [Free for commercial use](https://webflow.com/blog/gsap-becomes-free) under its own licence |
| Smooth scroll | **Lenis 1.3** | Open source, works with ScrollTrigger. Off on touch where native scrolling is better |
| 3D and light | **Three.js 0.187** | The 3D route needs a real 3D engine, so this replaces OGL. One engine runs both the route and the exposure. It loads after the first screen, so it doesn't delay the opening |
| 3D data | **OpenStreetMap, glTF-Transform** | Builds and compresses the township model once, at build time |
| Device tiering | **detect-gpu** | Chooses high, medium or still-image mode per device |
| Image and video | **Sharp, FFmpeg** | AVIF and WebP, short compressed video. FFmpeg is already installed |
| Footage grade and 3D | **Darktable, Blender** | Free tools for the grade and any pre-rendered shots |
| Interest list | **Cloudflare Worker + D1** or a form service | Decide in phase 3. It will hold personal data, so it needs a privacy note |
| Hosting | **Cloudflare Pages** | Free tier, fast for static sites |
| Testing | **Playwright, Lighthouse** | Real scroll checks on desktop and a throttled phone |

### Performance targets

- Text and first frame in under 2.5 seconds on 4G
- Under 150 KB of compressed JS before the first frame
- Heavy scene and video load after the first screen
- 60 fps on desktop, 30+ on a mid-range Android, tested on a real one
- Video only plays when on screen, and saves data when the browser asks

Only 2 pinned moments: The Loop and Last light. Too many and the page starts fighting the thumb.

---

## 9. What makes this not AI slop

Things this site will not do:

- Glassmorphism cards, purple gradients, generic neon glow
- Three stat tiles in a row, icon-in-a-circle feature grids
- Rows of identical cards fading up on scroll
- Fake testimonials, invented sponsors, invented past results
- A fake date or countdown. The live clock counts to the next hour, which is always true
- Parallax on body text, custom cursors, a long loading screen

---

## 10. Build phases

Your brief is hype first and concept only, so the first target is a working slice.

| Phase | Output | Needs from you |
|---|---|---|
| 0. Lock | Approve direction, name, palette | This review |
| 1. Look test | 3 full-screen visual comps, clips reviewed and graded | OK to spend on image generation with the existing OpenAI key |
| 2. Concept slice | Shutter and The Loop running live, with the 3D township, an illustrative route and the ring stack | Nothing |
| 3. Full concept | All 5 moments, phone tuning, fallbacks, and an email field that doesn't store data yet | Copy review, Hindi check |
| 4. Launch hype | Real email list, privacy note, domain | Name cleared, organiser details, decision on showing the route |
| 5. Entries | Date, course, fees, payments, rulebook, real footage | Race decisions |

---

## 11. Decisions still open

1. Is the working name EK AUR acceptable? One web search found no running event by that name, but that isn't a legal clearance. [India Backyard Ultra](https://bigsbackyardultra.com/races/india-backyard-ultra/) uses "Just One More Loop", so the idea is close, though the wording isn't
2. Should sound exist at all? I recommend off by default, with one optional bell
3. Roughly where would you start and finish? That lets me test real 6.706 km loops
4. Should the public site show the real streets, or stay abstract until permissions are in place?

---

## 12. Phase 1 results

**Comps.** The OpenAI key on this machine was rejected (401), so no images were generated and nothing was charged. The three frames were rendered locally instead, from real OpenStreetMap geometry and the real fonts. They are in `.impeccable/mocks/`: `comp-a.png` (light ring and type), `comp-b.png` (Hindi type hero), `comp-c.png` (3D township).

**Illustrative loop.** Traced on real roads, about 6.1 km after removing out-and-back spurs, so it is not 6.706 km and it is not a proposed course.

**Clips, reviewed by watching frames:**

| Clip | Verdict | Reason |
|---|---|---|
| Aerial Indian highway at night | Keep | Mostly black with one thread of light. Closest match to the exposure |
| Mumbai local train at night | Keep | Lit windows in the dark. Strongest local identity |
| Mumbai skyline at blue hour | Keep | For dawn only. Not Thakur Village, so never captioned as it |
| Hikers with headlamps | Keep | Real headlamp flare. Crop tight, as it is rocky terrain |
| Mumbai station at night | Reject | Duplicates the train clip, and is weaker |
| Foggy highway | Reject | Road signs show India Gate, so this is Delhi |
| Night traffic on Indian roads | Reject | Ordinary, and it reads as a different city |
| Runners' feet | Reject | Daylight |
| Woman jogging at night | Reject | Identifiable person, low resolution |
| Smoke with tube lighting | Reject | Identifiable person. Smoke will be made in code |

**Known weak spots:** the smoke in comp B is a stand-in that reads as a soft gradient. The test grade turns headlamp whites pink, so the final grade must protect highlights. Tower detail in comp C needs work at closer camera distances.

---

## 13. Build status

**The site is now one continuous film.** A single WebGL pass renders real photographs and footage, and every cut happens on a light: the camera flies into a light in one shot and out of a light in the next.

**What's built**

- An opening choice: Event intro plays the film, Register now goes straight to the form without downloading the film
- A countdown to 2 January 2027, marked tentative, in the opening and beside the form
- Opening, The Loop, Again (a lap sheet of three loops), The Night (hours 4 to 23), Last light with a runner in full stride, एक और
- Parallax on every photograph from estimated depth maps
- Route baked into a texture, so the film reveals it with no per-frame drawing
- Race time, loop and distance running through the whole film, capped at 24 loops, 160.9 km and 24:00:00, and a giant clock at hour 23
- Sound from real recordings: live mix per shot, footsteps paced by scroll speed, a bell when the loop closes
- Registration as a poster: the visitor's name stands in the sky behind the runner as they type it
- Contact us for more info, with both organisers' numbers
- Save my poster: a phone story of the visitor's name behind the runner, with their bib and dare
- Bib numbers in sign-up order, two invite codes each, invite-only and waitlist once a cap is set. Built, but off until a database is connected
- Prove it: the race answers a runner's biggest achievement and dares them to a number of loops
- Race day: live loop, runners left and a field that greys out, fed from a published Google Sheet
- Plain stacked page for reduced motion, no WebGL and no JavaScript
- Race clock prop at `/clock`

**All imagery is licensed.** Every image and clip on the site comes from Pexels, so local and deployed versions are identical. The earlier photos from other events are no longer used.

**Not built:** a chosen registration service, a rulebook page, and a real route. Until `PUBLIC_LIST_ENDPOINT` is set, the form says nothing was saved. The field size isn't shown, because no number has been decided.

**Measured:** 18 KB of compressed script before the film, 16 KB of it loaded only when the film runs. Clips stream as you approach them. Not yet tested on a real phone.

---

## 14. Night shoot

The one-evening plan to replace the borrowed photos is in `SHOOT-PLAN.md`. Recommended date: Saturday 21 November 2026.

---

## Appendix: other directions considered

The concept step dealt a direction and six outside challengers, then scored each on how well the audience would recognise it and how clearly it explains the race.

**Alternative worth a look: Western Line platform board.** The site as a Mumbai local train indicator: red dot-matrix, "next start in 37 min", loops listed like arrivals. It is the most instantly local idea, and it's my personal top pick. The risk is that it's a clever skin rather than an experience, and it says less about the emotion of the race. Doto type keeps a little of this inside The Long Exposure.

Other candidates of mine: giant LED clock as the page, headlamp beam revealing content, stadium flare crowd, Mumbai truck art.

| Challenger | Verdict | What The Long Exposure kept from it |
|---|---|---|
| Deep dive down an ocean wall | Competitive on clarity | One vertical axis ruling everything |
| Raku pottery in smoke | Declined | Hot colour only on what is still alive |
| Recording-desk VU meters | Declined | Numbers have mass and settle |
| Airport wayfinding | Declined | On phones, show only the next decision |
| Arcade pixel screen | Declined | Nothing |
| Kinetic sand glyphs | Declined | Nothing |

## Sources

- [Mumbai race listing](https://bigsbackyardultra.com/races/mumbai-backyard-ultra/), [India race listing](https://bigsbackyardultra.com/races/india-backyard-ultra/)
- [Backyard ultra format](https://www.wikipedia.com/wiki/Backyard_ultra), [UltraSignup guide](https://help.ultrasignup.com/hc/en-us/articles/44945078654861)
- [Thakur Village](https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.4everland.io/wiki/Thakur_Village.html)
- [Pexels licence](https://www.pexels.com/license/), [GSAP licence news](https://webflow.com/blog/gsap-becomes-free), [Anek repository](https://github.com/EkType/Anek)
