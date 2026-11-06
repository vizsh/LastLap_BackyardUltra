# LastLap design system

The site should feel like photographs of a real race at night. If something looks generated, it's wrong.

## Principles

- **Real media leads.** Photographs and footage carry the page. Code supports them.
- **One idea per screen, one line of copy.** About 120 words tell the whole story.
- **Every light has a source.** No decorative glow.
- **Red means still running.** Don't use it for decoration.
- **Darkness is the luxury.** Leave it empty.

## Colour

| Token | Value | Use |
|---|---|---|
| `--ink` | `#070304` | Main ground, warm black |
| `--flare` | `#FF3B2B` | Actions, hours, route |
| `--ember` | `#90272A` | Scrollbar and fading red |
| `--headlamp` | `#F1F3F5` | Text |
| `--dusk` | `#A9B6C9` | Secondary text |

Text pairings pass WCAG AA on ink.

## Type

| Role | Face | Setting |
|---|---|---|
| Display | Anek Latin | Weight 800, width 78%, tight leading |
| Hindi | Anek Devanagari | Subset to the glyphs in use |
| Body | Anek Latin | 1.0625rem |
| Data | Doto 900 | Clock, distance, hour counter |

If new Hindi words are added, rebuild the subset font, or they will fall back to a system font.

## Photo grade

`tools/media.py` holds the grade.

- Shadows go to ink, mids to red, and highlights stay white. Headlamps must never turn pink
- The aerial plate is drained of colour, so the route is the only strong red
- Dawn stays blue. It's the one moment without red
- Bottom third stays quiet for words, top left stays clear for the logo
- Phones get their own portrait crops from `tools/mobile-crops.py`

## Motion

- Scroll drives almost everything. One easing family, slightly slower than feels safe
- Text fades with a small rise. Shots dip through black
- Animate only opacity and transform. No filters on large areas
- Respect reduced motion: no pinning, no scrubbing, everything stacked and readable
- The bell is off until a visitor turns it on

## Layout

- No navigation bar. The 00 to 24 hour rail is the progress bar and the menu
- No cards, stat rows, FAQ or galleries on the main page
- Four facts and one email field are the whole information area

## Rules for content

- Never invent a date, price, route, result, testimonial or sponsor
- Anything unconfirmed stays labelled: "Illustrative route", "To be announced"
- Staged photographs must be labelled as staged. No LastLap race has taken place yet
- Don't claim affiliation with any other race or series
