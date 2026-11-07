# LastLap design system

The site should feel like a film about a real race at night. If something looks generated, it's wrong.

## Principles

- **Real media leads.** Photographs and footage carry the page. Code only moves the camera and the light.
- **One film, no sections.** Nothing swaps or jumps. The picture is always moving, even when scrolling stops.
- **Every cut happens on a light.** The light is what carries you from shot to shot.
- **One idea per screen, one line of copy.**
- **Darkness is the luxury.** Leave it empty.

## Colour

| Token | Value | Use |
|---|---|---|
| `--ink` | `#070304` | Main ground, warm black |
| `--flare` | `#FF3B2B` | Actions, hours, counters |
| `--ember` | `#90272A` | Scrollbar |
| `--headlamp` | `#F1F3F5` | Text |
| `--dusk` | `#A9B6C9` | Secondary text |

Photographs keep their natural night colour. Red comes from what's in the scene, not from a filter.

## Type

| Role | Face | Setting |
|---|---|---|
| Display | Anek Latin | Weight 800, width 78%, tight leading |
| Hindi | Anek Devanagari | Subset to the glyphs in use |
| Body | Anek Latin | 1.0625rem |
| Data | Doto 900 | Clock and counters. Draw `:` and `.` with the `.colon` and `.pt` elements, because Doto's own marks fail at small sizes |

If new Hindi words are added, rebuild the subset font, or they will fall back to a system font.

## Choosing imagery

- Dark, sharp, and with a clear light source that a cut can happen on
- Favour silhouettes, backs and distant figures. Pexels doesn't allow implying endorsement
- No visible sponsors, brands or event names
- Quiet bottom third for words, clear top left for the logo
- Check it at full size on a phone crop before accepting it. Soft footage is not acceptable
- Use 4K sources for video where possible, and judge frames at 1:1

## Motion

- Scroll drives the film. Camera drift and handheld sway keep it alive when scrolling stops
- Transitions are a lens catching a light, never a flash. The picture stays readable through the flare
- Words rise out of masks as the light recedes, and leave as it swells
- Only transform and opacity on page elements. Heavy visual work belongs in the shader
- Reduced motion gets a plain stacked page

## Sound

- Off until the visitor chooses it
- Real recordings only. Beds follow the shot, and the filter closes as the lens flares
- Footsteps follow scroll speed

## Layout

- No navigation bar beyond the logo, Sound and Register
- One persistent race readout: loop, kilometres and time
- No cards, stat rows, FAQ or galleries

## Key moments

- **The opening** is two choices set in display type, Event intro and Register now, with a quiet sound switch. Event intro stays dim while the film loads, and its underline is the loading bar. Register now works at once
- **Again** is a lap sheet. Each loop adds a row with a hairline and its loop number, pushes the last row up, and is heavier and narrower than the one before: weight 300 at width 116%, then 500 at 96%, then 800 at 76%. The camera steps closer on each bell
- **The registration poster** stands words in the sky of the Last light photograph, between the photograph and a cut-out of its own runner and land. The invitation stops short of the runner so it can be read whole. A typed name fills the sky and runs behind them. The two photographic layers never move apart, or the runner shows a double edge

## Rules for content

- Never invent a date, price, route, result, testimonial, sponsor or field size
- Anything unconfirmed stays labelled: "Illustrative route", "To be announced", "Tentative"
- Stock or staged images must not be presented as a past LastLap race
- Don't claim affiliation with any other race or series
