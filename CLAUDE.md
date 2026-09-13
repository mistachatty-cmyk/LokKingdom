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

- `MAP` / `GROUND`: 96×96 `Uint8Array`s, one byte per tile. Collision and
  wall materials stay separate from meadow, road, settlement, and quarry
  ground. `buildRealm()` deterministically lays out the current medieval
  slice so it stays self-contained.
- `WORLD_SEED` / `CHUNK_META`: a remembered or `?seed=`-supplied value drives
  deterministic 16×16 biome chunks, rough terrain, tree density, frontier
  sites, and danger. Authored story locations stay stable across seeds.
- `LEGACY_MAZE`: preserves the original 25×16 test map as **The First Maze**
  at world coordinates `(7,44)`, with one eastern access tile added.
- `LANDMARKS` / `REGIONS`: authored realm identity and lightweight
  settlement values without adding player identity.
- `SPRITE_BUCKETS`: world objects bucketed into 16×16 chunks;
  `nearbySprites()` prevents the renderer from scanning the whole realm.
- `MATERIALS`: per-material height multiplier + two colors (N/S faces
  vs E/W faces) for cheap directional lighting.
- `castRay()`: grid DDA raycast, one call per screen column, returns
  hit distance / which face / material id.
- `SPRITES` / `SPRITE_GLYPHS`: billboarded objects (trees, an NPC)
  projected into screen space, depth-tested per column against the
  wall pass so they're hidden correctly behind walls.
- `render()`: builds a `[ROWS][COLS]` character+color grid, then
  flattens it into one run-length-encoded HTML string (grouping
  consecutive same-color runs into a single `<span>`) written to a
  `<pre>` element once per frame.
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

1. Add a placement cursor and build rules for player-built walls, gates,
   houses, and settlement plots (no account/player identity yet)
2. Add nearby follower agents and chunk-aware navigation
3. Represent distant parties/armies as aggregate warbands, expanding them
   into individual agents only near the player
4. Add settlement ownership, recruitment, supplies, sieges, and diplomacy
5. Add variable wall heights read per tile (not just per material)
6. Move authored realm definitions into ASC113-compatible data without
   limiting browser UI or ecosystem systems to that format
7. Multiple maps / region transitions
8. Swap `<pre>` + spans for `<canvas>` + `fillText` if color count or
   frame size makes DOM spans a measured bottleneck (don't do this
   preemptively — only if profiling shows it's needed)
9. ~~Mobile touch controls (virtual joystick + drag-to-look)~~ — done
10. Sound via WebAudio, kept inline (no external audio files)

When picking up work here, default to the next unchecked roadmap item
unless told otherwise.
