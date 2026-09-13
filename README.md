# LokKingdom

A tiny, zero-dependency 3D open-world engine that renders a grid-based realm as
colored ASCII/text characters — one raycast per screen column, no
Three.js, no models, no build step. The whole game is a single
`index.html` file you can open directly in a browser or drop onto any
static host.

The current realm is a deterministic 96×96 medieval region containing
Lokhaven Hold, two villages, an old watch, a quarry, wilderness, and a
road network. The original test maze is preserved inside the realm as **The
First Maze**, an ancient special location with a new eastern entrance. It is a
compact first slice of a much larger goal: player-built
settlements, castles and kingdoms, recruitable followers, armies, and
Bannerlord-inspired wars that remain practical in a mobile browser.

Inspired by the "walkable ASCII city in one HTML file" trend — built
from scratch as a small, expandable foundation rather than a tech demo.

## Run it

Just open `index.html` in a browser. No install, no server required
(though `python3 -m http.server` works fine if you want pointer-lock
mouse look to behave consistently across browsers).

## Controls

- `W A S D` / arrow keys — move
- `Q` / `E` — turn
- `P` or `Esc` — pause / resume
- Main menu — enter the realm or open device settings
- Pause menu — resume, inspect the local realm map without advancing time,
  open settings, or return to the main menu
- Settings — local text scale, reduced motion, touch-debug visibility, gyro,
  and gyro inversion preferences; no account is required
- Click the screen, then move the mouse — free look (pointer lock)
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

- **World**: compact `MAP` and `GROUND` typed arrays use one byte per tile.
  `MAP` stores collision/wall materials while `GROUND` independently marks
  meadow, roads, settlement ground, and resource terrain.
- **Scale**: world objects are grouped into 16×16 spatial chunks. Only
  nearby chunks are queried for rendering; distant settlements keep only
  lightweight aggregate values such as population, stores, and defenders.
- **Seeds**: every device receives a remembered world seed. The seed
  deterministically changes chunk biomes, rough terrain, tree density, danger,
  and optional frontier locations while preserving important authored places.
  Open `?seed=your-seed` to recreate or share a specific realm, or use **New
  world** inside the realm map.
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

Roughly in order of effort:

- [x] Replace the hardcoded test maze with a deterministic large realm
- [x] Spatially bucket world objects and add aggregate settlement state
- [x] Add a local realm map and named regions/landmarks
- [x] Preserve the original maze as a discoverable special location
- [x] Generate deterministic biomes and frontier sites from shareable seeds
- [ ] Add an in-game building cursor for walls, gates, and settlement plots
- [ ] Add nearby follower agents plus distant aggregate warbands
- [ ] Add navigation/pathfinding that wakes only inside active chunks
- [ ] Load authored realm definitions from ASC113-compatible data while
      preserving the single-file/browser pipeline
- [ ] Variable wall heights read per-tile (not just per-material)
- [ ] More sprite types + simple animation frames (e.g. idle bob)
- [x] Basic landmark interaction and settlement information
- [x] Minimap overlay (toggle key) using the same `MAP` data
- [ ] Simple enemy/NPC movement (wander or chase within the grid)
- [ ] Multiple maps / level transitions (kingdom regions)
- [ ] Swap the `<pre>` renderer for `<canvas>` + `fillText` once color
      count / frame size makes DOM spans a bottleneck
- [x] Mobile touch controls (virtual joystick + drag-to-look) + gyro look
- [ ] Sound (WebAudio, single small file, no external assets)

## Deployment

Zero-config static deploy — point Vercel (or any static host) at this
repo. `vercel.json` sets `framework: null` so Vercel serves `index.html`
as-is with no build step.

## Smoke test

Run `node smoke-test.cjs` to initialize the generated realm, execute a render
frame, draw the local map, and verify the Lokhaven interaction without adding
any test dependencies.

## License

MIT — see `LICENSE`.
