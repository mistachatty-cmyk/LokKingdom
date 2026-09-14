# LokRealm World Scale Plan

## Promise

LokRealm's current 48×48 realm is the **starting region**, not the final
world size. The eventual game should feel effectively boundless while keeping
only a small neighborhood in memory and rendering only what the player can
see. It must remain a dependency-free browser game that works on phones.

## The chunk contract

The world is addressed by signed chunk coordinates:

```text
world seed + chunkX + chunkY -> deterministic base terrain, roads, flora, lots
chunk key: "chunkX,chunkY"  (examples: "0,0", "-1,0", "12,-8")
```

- A chunk initially uses the same compact 48×48 tile format as the starter
  region. This preserves the raycaster and lets us tune the format before
  enlarging any part of the engine.
- A player normally holds only a 3×3 chunk window (active chunk plus its eight
  neighbors). The raycaster reads the current active tile window, while the
  simulation uses summaries for everything farther away.
- Chunks are regenerated from their coordinates whenever revisited. Only user
  changes are saved: placed roads/buildings, harvested trees, terrain edits,
  water sources, settlement summaries, and local event state.
- Roads and rivers are generated from world-coordinate edge contracts so a
  feature leaving one chunk enters the next at the same edge position.

## Persistent data

```text
world seed
  + player/freehold construction records
  + chunk deltas keyed by "x,y"
  + aggregate settlement and faction records
```

Untouched terrain is never stored. A future save can stay small even after a
player has travelled across thousands of chunks.

## Simulation and performance rules

| Distance from player | Representation |
|---|---|
| Active area | Full tile grid, sprites, water, nearby NPCs, raycasting |
| Neighboring chunks | Cached terrain + simple spawn/road summaries |
| Distant settlements | Aggregate population, resources, jobs, relations, calendar events |
| Distant wilderness | Deterministic seed only until visited |

- Run water, pathing, and individual NPC movement only in the active area.
- Advance distant settlements on coarse in-game days, not every animation
  frame.
- Evict unused chunks with a small LRU cache; never grow memory with travel.
- Keep construction entries in world/chunk coordinates from the beginning, so
  a cottage or wall is portable when chunk streaming arrives.

## Delivery order

1. Keep the current starter region as chunk `0,0`; make player constructions
   explicit, persistent records.
2. Extract deterministic `generateChunk(seed, chunkX, chunkY)` from the
   starter generator and add border-consistent roads/rivers.
3. Stream a 3×3 active neighborhood with safe handoff at chunk boundaries.
4. Add biome/settlement catalogs and aggregate distant simulation.
5. Add terrain height, bridges, walls, forts, and eventually progressive voxel
   sectors where the player needs vertical building.

## Why this also supports urban worlds

The streaming contract is indifferent to theme. Medieval chunks can generate
trails, farms, forts, and groves; urban chunks can generate streets, lots,
utilities, apartment blocks, traffic, and civic services. The shared layers
remain terrain, structures, residents, jobs, roads, water, and editable
deltas.
