# LokRealm

A tiny, zero-dependency living-world engine that renders a seeded world as
colored ASCII/text characters — one raycast per screen column, no
Three.js, no models, no build step. The whole game is a single
`index.html` file you can open directly in a browser or drop onto any
static host.

Inspired by the "walkable ASCII city in one HTML file" trend — built
from scratch as a small, expandable foundation rather than a tech demo.

## Living settlements

The world contains two simulated cultures. Human settlement Hearthmere grows
through supported households, housing, food, water, care, work, immigration,
and maturation. The chlorophyll-rich Diligy of Verdanthold grow cooperatively
through light, water, nutrients, root links, helpers, seedlings, and a Grove
Heart. Both advance through six stages, unlock structures, record history, and
develop relations through trade.

Buildings are semantic blueprints rather than anonymous rectangles. Their
cells retain structure ownership, height, roof, door/window, material, race,
condition, and settlement identity, which the renderer turns into varied
facades and silhouettes.

## Build a freehold

Harvest trees for wood, open **PACK**, then choose **Build realm**. Claim one
clear, dry tile with a Claim Post (4 wood), then place freehold cottages
(8 wood), palisade sections (2 wood), and roads (1 wood). These player-made
changes persist with the seed and are exported with the world. The initial
freehold is deliberately neutral—there is no forced player character identity
yet—so it can later become a village, fort, kingdom, or a different urban
world role.

The current map is starting region `0,0`, not a final boundary. See
[`docs/WORLD_SCALE_PLAN.md`](docs/WORLD_SCALE_PLAN.md) for the deterministic
chunk-and-delta path toward an effectively unlimited world without loading it
all at once.

## Water sandbox

LokRealm has a lightweight shallow-water layer: each open grid cell stores
water depth and shares it with lower neighboring terrain at a capped rate. The
world seeds ponds and springs, while the editor can place a **Water Spring** or
**Raise Land** to shape flow. It is browser-native and designed for streams,
ponds, irrigation, flooding, and later erosion—not a full GPU fluid solver.

## Run it

Just open `index.html` in a browser. No install, no server required
(though `python3 -m http.server` works fine if you want pointer-lock
mouse look to behave consistently across browsers).

## Controls

- `W A S D` / arrow keys — move
- `Q` / `E` — turn
- Click the screen, then move the mouse — free look (pointer lock)
- `F` / Space — talk, inspect, or use the equipped axe
- `I` — inventory; `M` — minimap; `J` — settlements; `Tab` — world editor; `P` — pause
- The always-visible **Pause/Resume** button pauses both the game and water simulation.
- **Touch**: MAP, PACK, and REALM quick buttons expose the same systems. Open
  PACK, then **Build realm** to use the construction palette.
- **Touch** (phones/tablets): dual joysticks, both dynamic — a stick
  pops up right where you touch down rather than sitting fixed in a
  corner. Left half of the screen moves, right half looks (holding it
  turns/looks continuously, like a real analog stick — the further you
  push, the faster). Both work at once since each is tracked by its
  own touch point.
- **Gyro** (touch devices): tap "Enable Gyro Look" (top-right) to look
  around by tilting the device instead of using the right stick — tap
  again to turn it back off. iOS asks for a motion-sensor permission
  the first time — that's the browser, not this app. Tilt is
  calibrated to however you're holding the device when you enable it.
  Grabbing the right (look) stick always takes over from gyro while
  it's held, so the two never fight — release it and gyro resumes
  smoothly from wherever you ended up, no snap. "Invert Gyro" (below
  it, on by default) flips the tilt-up/down direction, like an
  inverted flight-stick — the default most gyro-look games ship with.

## How it works

- **World**: a flat array of strings (`MAP`) where each character is a
  tile — `.` empty, digits `1`/`2`/`3` are wall materials.
- **Materials**: each material id maps to a height multiplier and two
  colors (north/south-facing vs east/west-facing walls), giving cheap
  directional "lighting" for free.
- **Raycasting**: classic grid DDA (like Wolfenstein 3D) — one ray per
  screen column, walked cell-by-cell until it hits a wall tile.
  Distance to the hit determines wall height and character shade.
- **Floor/sky**: everything above/below the wall slice per column is
  filled with distance-shaded floor or sky characters.
- **Sprites**: billboarded objects (trees, an NPC) projected into
  screen space and depth-tested against a per-column depth buffer
  collected during the wall pass, so they're correctly hidden behind
  walls.
- **Rendering**: characters + colors are flattened into a single
  run-length-encoded HTML string per frame (grouping consecutive same-
  color characters into one `<span>`) and written to a `<pre>` element.

Everything lives in `index.html` on purpose — no bundler, no
dependencies, easy to paste into any host or game-template system.

## Roadmap / how to expand this

The current priority order is:

- [ ] Deterministic chunk streaming: seed + chunk coordinates + saved edit deltas
- [x] Player freehold: claim, cottage, palisade, roads, wood costs, persistence
- [ ] Construction queues, NPC jobs, housing, food, and maintenance
- [ ] Rotatable prefab sockets, bridges, gates, road grades, forts, and castles
- [ ] Multiple biomes, settlement catalogs, and an urban generation catalog
- [ ] Sprite animation frames and a dedicated visual/model quality pass
- [ ] Swap the `<pre>` renderer for `<canvas>` + `fillText` once color
      count / frame size makes DOM spans a bottleneck
- [x] Mobile touch controls (virtual joystick + drag-to-look) + gyro look
- [ ] Sound (WebAudio, single small file, no external assets)

## Deployment

Zero-config static deploy — point Vercel (or any static host) at this
repo. `vercel.json` sets `framework: null` so Vercel serves `index.html`
as-is with no build step.

## License

MIT — see `LICENSE`.
