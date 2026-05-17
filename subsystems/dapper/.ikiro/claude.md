> ⚠️ **VCS READ-ONLY.** Never run mutating `git`/`jj`. ALL graph mods (rebase, describe, new, edit, restore, op restore, push, fetch, import, abandon, squash, split) require explicit per-op `go` from Finn. Propose → wait → Finn runs via `!`. See root `.ikiro/claude.md` banner. **VIOLATED 2026-05-04 — NEVER AGAIN.**

# IKIRO — dapper (container)

Theming. Design system. The pipeline `colors → tokens → themes → output (CSS + Tailwind)` that drapes/kajuit consume. Read `.ikiro/CLAUDE.md` first.

## architecture

functional pipeline.

Dapper has no runtime presence. It's a build-time generator: palette colors → semantic tokens → applied theme → CSS variables + Tailwind utility classes. Drapes (Svelte components) and kajuit (the surface) read its output through CSS variables and Tailwind classes; neither imports dapper JS at runtime.

The pipeline is a reduce over four pure functions:

```
[colors, tokens, themes, generateCSS]
  .reduce((ds, fn) => ds.then(fn), Promise.resolve({}))
```

Each function transforms the accumulated design-system object. Final output: CSS variables under `:root[data-theme="dark"]`, plus a Tailwind classes object via `tailwindClasses`.

structure:

```
subsystems/dapper/
├── mod.js                 barrel (palette, tokens, builders, generateCSS, themes, postcssPlugin, tailwindClasses)
├── primitives/
│   ├── colors.js          palette (named scales) + tint (alpha variants)
│   ├── tokens.js          font, spacing, shadow, border primitives
│   ├── builders.js        constructor helpers for color types
│   ├── bsp.css            grid layout primitives (.bsp-node, .h2/.v3 partitions)
│   └── font.css           font-face declarations
├── lib/
│   ├── colors.js          re-export
│   ├── tokens.js          re-export
│   ├── builders.js        re-export
│   └── flatten.js         generateCSS, generateZoneCSS, ZONE, ZONE_COUNT — flatten tokens → CSS variables
├── themes/
│   ├── index.js           theme registry
│   └── dark.js            current default — maps palette to skeleton/theme/system semantic roles
├── belt/                  postcss-plugin + tailwind-theme generator
├── lifecycle/             plugin orchestration
└── tests/                 (subset; see testing gaps below)
```

semantic systems (each follows `surface / contrast / boundary` + `hover`):

- **skeleton** — structural UI surfaces, numbered 1-4 by elevation. skeleton-1 = primary (cards, panels). skeleton-4 = overlays. Higher = lighter in dark theme.
- **theme** — brand identity. primary / secondary / accent. User-facing personality.
- **system** — fixed-meaning state. info / success / warning / error. Transcends themes.

zone CSS:

`generateZoneCSS` emits scoped CSS for `data-zone="<n>"` (0..ZONE_COUNT-1), supporting decorum's zone-based theming quest. Each zone gets its own copy of the skeleton/theme tokens under the zone selector. See `.ikiro/quests/decorum.quest.org` (M1 done, M2-M5 open).

drapes/kajuit integration:

```
dapper (generates)        →  CSS variables + Tailwind classes
drapes (consumes)         →  components reference --colors-skeleton-1-surface, bg-theme-primary-surface
kajuit (composes)         →  applies data-theme="dark" / data-zone="N" on container elements
```

Drapes never imports dapper JS. The design system is its own build pass; runtime sees only CSS.

## context

dependencies:
- Pure JS, no Deno runtime deps. Used by Vite/PostCSS/Tailwind build configs.

consumers:
- subsystems/drapes (Svelte component library — `<Button>`, `<Shelve>`, `<Plane>`, `<Box>`, etc.)
- systems/kajuit (`tailwind.config` extends with `tailwindClasses`; PostCSS pipeline emits CSS variables)

active work:
- root `.ikiro/quests/decorum.quest.org` — zone-based theming; M1 done (CSS pipeline + zone primitives shipped), M2-M5 open (`<Zone>` wrapper, DECORUM context, zone-aware components, multi-theme support)

testing:
- Existing tests under `tests/` cover token flattening + zone CSS generation
- gaps: theme overrides not unit-tested; PostCSS plugin integration tested only at the build-system level

invariants:
- Color semantics use `surface / contrast / boundary` triple uniformly (skeleton, theme, system all follow it)
- BSP grid (`bsp.css`) is independent of color system — layout primitives don't carry theme tokens
- Multiple outputs (PostCSS variables + Tailwind classes) from ONE source — never let them diverge
