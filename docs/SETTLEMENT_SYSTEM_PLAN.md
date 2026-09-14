# LokRealm Settlement and Civilization Plan

## Goal

Grow the current portable ASCII raycaster into a living medieval world where
roads create lots, lots become distinct architecture, residents build lives,
settlements expand, and settlements eventually form forts and kingdoms. The
same systems must later support urban worlds without replacing the engine.

## Architecture layers

1. **Land** — seed, biome, water, soil, sunlight, resources, elevation, chunks.
2. **Structure** — semantic blueprints, facade features, roofs, condition,
   function, ownership, upgrades, and interiors.
3. **Settlement** — race, specialization, population, needs, production,
   services, territory, stage, construction queue, and history.
4. **Population** — residents, homes, work, schedules, relationships, lifecycle,
   migration, health, care, skills, memory, and dialogue.
5. **Faction** — laws, leadership, diplomacy, trade, conflict, armies, vassals,
   settlements, territory, and succession.

## Implemented vertical slice

- Human Hearthmere: crossroads specialization, homes, tavern, watchtower,
  households, children, maturation, migration, food/water/work/care/safety.
- Diligy Verdanthold: Sun Grove specialization, Grove Heart, growth pods,
  canopies, cooperative helpers, seedlings, light/water/nutrients/root links.
- Six growth stages per race, stage thresholds, stage-triggered construction,
  named residents, daily simulation, local persistence, world export, history,
  weekly exchange, faction relations, and an inspectable `J` ledger.
- Semantic building cells with height, roof, door, window, material, race,
  structure identity, and settlement identity. The renderer uses these fields
  for non-block facades and pitched silhouettes.

## Settlement catalog

### Human

- Road camp, hunting outpost, fishing hamlet, farming village
- Mining settlement, monastery, market town, port town
- Fort settlement, walled city, castle town, kingdom capital

### Diligy

- Sprout circle, Sun Grove, Root Colony, Seedling Sanctuary
- Wetland grove, canopy settlement, wandering seed-garden
- Root Citadel, ancient world-tree settlement, Green Dominion

## Next build phases

### Phase A — architecture depth

- Rotatable blueprints, roof slopes/top surfaces, arches, gates, crenellations
- Cottage, manor, mill, forge, stable, barracks, keep, curtain wall, bridge
- Diligy root bridges, living chambers, sun towers, nursery and defensive thorns
- Doors leading to lightweight interior sectors

### Phase B — settlement agency

- Construction queues selected from shortages and goals
- Work assignments, inventories, maintenance, damage, repair, fire and blight
- Lot subdivision from roads and terrain-aware expansion boundaries
- Player-assisted construction and an editor prefab palette

### Phase C — people and generations

- Named household and kinship records for Humans
- Abstract, supported family growth based on consenting adult households,
  housing, food, health, safety and caretaker capacity
- Diligy growth circles, helper relationships, lineage groves and graft traits
- Childhood/seedling development, education, professions, aging and succession

### Phase D — kingdoms

- Leaders, councils, laws, taxes, claims, patrols, militias and armies
- Trade routes, alliances, rivalry, war, peace, vassalage and cultural exchange
- Villages supporting forts; towns becoming regional capitals
- Bannerlord-style followers, parties, sieges and settlement governance

### Phase E — engine scale and urban mode

- Deterministic chunk streaming and edit deltas
- Elevation, stacked sectors, roof traversal and progressive voxel meshing
- Replace medieval catalogs with urban roads, zoning, utilities, buildings,
  traffic and civic-service templates while retaining shared simulation APIs

## Performance rules

- Simulate distant populations in aggregates; instantiate individuals nearby.
- Save seed plus changed deltas instead of whole untouched chunks.
- Run settlement days at low frequency and render only the active area.
- Keep all initial features dependency-free and mobile-safe.
