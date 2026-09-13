# LokKingdom

A tiny, zero-dependency 3D engine that renders a grid-based world as
colored ASCII/text characters — one raycast per screen column, no
Three.js, no models, no build step. The whole game is a single
`index.html` file you can open directly in a browser or drop onto any
static host.

Inspired by the "walkable ASCII city in one HTML file" trend — built
from scratch as a small, expandable foundation rather than a tech demo.

## Run it

Just open `index.html` in a browser. No install, no server required
(though `python3 -m http.server` works fine if you want pointer-lock
mouse look to behave consistently across browsers).

## Controls

- `W A S D` / arrow keys — move
- `Q` / `E` — turn
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

Roughly in order of effort:

- [ ] Load `MAP` from a JSON/data file instead of a hardcoded string,
      so levels ("kingdoms"/regions) can be authored separately
- [ ] Variable wall heights read per-tile (not just per-material)
- [ ] More sprite types + simple animation frames (e.g. idle bob)
- [ ] Basic interaction: walk into a sprite to trigger a message/pickup
- [ ] Minimap overlay (toggle key) using the same `MAP` data
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

## License

MIT — see `LICENSE`.
