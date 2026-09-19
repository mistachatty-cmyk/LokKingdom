# CLAUDE.md

This file is read automatically by Claude Code at the start of every
session in this repo. Keep it current as the project evolves.

## What this is

LokKingdom — a zero-dependency ASCII/text-rendered 3D engine. The world
is a grid, rendered with one raycast per screen column (Wolfenstein-
style DDA), and every visible surface is a colored monospace character
instead of a textured pixel. No Three.js, no 3D models, no build step.

Inspired by the "walkable ASCII city in one HTML file" trend, built
from scratch as a small, expandable foundation rather than a demo.

## Ground rules for this repo

- **Single-file delivery is intentional.** `index.html` contains all
  HTML/CSS/JS inline. Don't split it into a bundler-based project
  (webpack/vite/etc.) unless explicitly asked — the whole point is
  zero build step, paste-anywhere portability.
- **Zero-Drain**: no paid infra, no new backend services. If a feature
  needs persistence later, prefer localStorage or a free-tier option
  already used elsewhere in the Lok ecosystem (Supabase) rather than
  standing up something new.
- **No external asset dependencies** (no image/font/sound files fetched
  from a CDN) unless a step in the roadmap below explicitly calls for
  it. The engine's whole aesthetic depends on being self-contained.
- Keep functions small and named by what they do (`castRay`, `render`,
  `update`) — this file is meant to stay readable top-to-bottom as a
  single script, not split into modules.

## Architecture (current state)

- `MAP`: array of strings, one char per tile. `.` = empty, digits =
  wall materials.
- `MATERIALS`: per-material height multiplier + two colors (N/S faces
  vs E/W faces) for cheap directional lighting.
- `castRay()`: grid DDA raycast, one call per screen column, returns
  hit distance / which face / material id.
- `SPRITES` / `SPRITE_TYPES`: billboarded objects (trees, villagers, a
  mayor, a forester, soldiers) projected into screen space, depth-tested
  per column against the wall pass so they're hidden correctly behind
  walls. Each type's *shape* comes from `humanoidSilhouette()` /
  `treeSilhouette()` — proportions (head/shoulder/waist/leg fractions,
  or canopy/trunk split) generated procedurally into a `[subRows][cols]`
  grid of palette-key strings, not hand-typed ASCII-art rows. Add a new
  type by giving it a shape function + a `palette` (legend key -> hex
  color), not by drawing a new sprite sheet.
- `render()`: builds `[ROWS][COLS]` character + foreground-color +
  background-color grids, then flattens them into one run-length-encoded
  HTML string (grouping consecutive same fg+bg runs into a single
  `<span>`) written to a `<pre>` element once per frame. Sprites pack two
  vertical "pixels" into each character cell via `▀`/`▄` half-block
  glyphs (`paintSpriteCell()`) — foreground = the cell's top half,
  background = its bottom half — doubling their effective vertical
  resolution versus one flat character per cell. Walls/floor still use
  one color per cell (background stays the page default there).
- `update()`: WASD/arrow movement with axis-separated collision
  (slides along walls instead of stopping dead), Q/E keyboard turn,
  pointer-lock mouse look, plus touch (virtual joystick + drag-to-look)
  and gyroscope (tilt-to-look) input — see "Input" below.

## Input

Desktop: `W A S D` / arrow keys to move, `Q`/`E` to turn, click the
canvas then move the mouse to look (pointer lock).

Touch (shown only on `pointer: coarse` devices via CSS media query):
dual dynamic joysticks, both positioned via inline `left`/`top` set in
`onTouchStart` (not fixed in CSS) so each spawns right where you touch
down rather than sitting in a fixed corner. Left half of the screen is
`joystickTouchId`/`joyDX`/`joyDY`, driving forward/back/strafe the same
way WASD does. Right half is `lookTouchId`/`lookJoyDX`/`lookJoyDY`,
applied in `update()` as a continuous rate (`LOOK_TURN_SPEED`,
`LOOK_PITCH_SPEED`) rather than a 1:1 drag — hold it deflected and it
keeps turning, like a real analog stick, matching the deliberate L=move
R=look convention (never swap this without being asked; it's the
universal mobile/console FPS layout). Both sticks are tracked by touch
`identifier` so they work simultaneously as two fingers.

iOS Safari can occasionally fail to deliver `touchend`/`touchcancel`
for a touch, permanently orphaning `joystickTouchId`/`lookTouchId` so
no new real touch can ever match it (this was a real shipped bug — see
git log). `releaseStaleTouches()` cross-checks both ids against the
browser's own live `e.touches` on every `touchstart`/`touchmove` and
releases anything no longer actually present; don't remove this.

Gyro: a button (touch devices only) requests `DeviceOrientationEvent`
permission (required gesture-gated on iOS Safari), then toggles fully
on/off on each tap (`startGyro()`/`stopGyro()`) — steers look by
tilting the device, tilt measured relative to whatever angle the
device was held at when gyro was (re-)enabled (recalibrated every time
you turn it on), not absolute compass heading, since raw compass data
is unreliable across devices/browsers. Yaw and pitch are both
proportional to current tilt-from-neutral (bounded, self-centering),
never accumulated over time — an earlier accumulating-rate version let
any incidental tilt (e.g. a thumb reaching for the joystick) silently
spin the player away over a few seconds. **The right (look) stick
always takes priority over gyro while actively held** — `update()`
only applies gyro's angle/pitch when `lookTouchId === null` — and
`gyroBaseAngle` is continuously resynced to the current angle while the
stick is held, so gyro resumes smoothly (no snap) the moment you let
go. A second button, "Invert Gyro", flips the tilt-to-pitch sign
(`gyroInverted`, defaults to `true`) — most gyro-look implementations
default to inverted (tilt back = look down), so that's the shipped
default here too; it only affects gyro pitch, not stick/mouse look.

A yellow on-screen debug HUD (`#debug-hud`, touch devices only) shows
live touch-event counts and both sticks'/gyro's current state — keep it
working; it's what actually diagnosed the orphaned-touch bug above when
a phone couldn't be debugged any other way.

## How to run / test

No build step. Open `index.html` directly in a browser, or:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

There's no test suite yet — verify changes by playing the map and
checking the FPS counter (top-left HUD) doesn't regress. For touch/
gyro input specifically, test in a real mobile browser (or Chrome
DevTools device toolbar for touch simulation — it can't simulate
`deviceorientation` events, so gyro needs a real device).

## Deployment

Deploys to Vercel as a static site (`vercel.json` sets `framework:
null` so Vercel doesn't try to detect/build a framework) — `index.html`
at the repo root is served as-is, no build command needed.

## Roadmap (priority order)

1. Load `MAP` from a JSON/data file instead of a hardcoded string, so
   levels can be authored separately from engine code
2. Variable wall heights read per-tile (not just per-material)
3. More sprite types + simple animation frames (idle bob, etc.)
4. Basic interaction: walking into a sprite triggers a message/pickup
5. Minimap overlay (toggle key), reusing the same `MAP` data
6. Simple NPC movement (wander or chase within the grid)
7. Multiple maps / level transitions
8. Swap `<pre>` + spans for `<canvas>` + `fillText` if color count or
   frame size makes DOM spans a measured bottleneck (don't do this
   preemptively — only if profiling shows it's needed)
9. ~~Mobile touch controls (virtual joystick + drag-to-look)~~ — done
10. Sound via WebAudio, kept inline (no external audio files)

When picking up work here, default to the next unchecked roadmap item
unless told otherwise.
