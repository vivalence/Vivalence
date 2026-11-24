# the anchored rows of entity.build.py: (file → [(old, new, times)]) and the moves. Read by exec, never run alone.
SPECIAL = {
    "subsystems/paladin/prototypes/integrity.js": [('VIEWABLE: "views"', 'SURFACED: "surfaces"', 1)],
    "subsystems/paladin/gestalten/commands/instance/cleanup.js": [
        ("stale view bundles", "stale surface bundles", 2),
        ("a view's own bundle", "a surface's own bundle", 1),
        ("every generated view stay", "every generated surface stay", 1),
    ],
    "subsystems/paladin/gestalten/commands/ledger/cleanup.js": [
        ("stale view bundles", "stale surface bundles", 1),
    ],
    "subsystems/paladin/tests/bundler.test.js": [("a view's named bundle", "a surface's named bundle", 1)],
    "subsystems/typology/schematics/primitives/contexts.js": [
        ("serves views and files", "serves surfaces and files", 1),
    ],
    "systems/ghost/tests/subjects/terminal/commands.test.js": [
        ("const VIEWS = {", "const SURFACES = {", 1),
        ("Object.values(VIEWS)", "Object.values(SURFACES)", 1),
        ("VIEWS[", "SURFACES[", 1),
    ],
    "systems/runtime/gestalten/tools/generative.js": [
        (
            '} view${rows.length === 1 ? "" : "s"} on this mode',
            '} surface${rows.length === 1 ? "" : "s"} on this mode',
            1,
        ),
    ],
    "systems/runtime/tests/runtime/beats.coverage.test.js": [
        (
            '["activity", "buffer", "file", "intent", "note", "terminal", "thread", "turn", "view"]',
            '["activity", "buffer", "file", "intent", "note", "surface", "terminal", "thread", "turn"]',
            1,
        ),
    ],
    "commons/instances/hello-world/mode.viva.js": [
        ('"GENERATIVE",     ', '"SURFACING",      ', 1),
    ],
    "subsystems/typology/entities/View.ts": [
        (
            'import * as crypto from "../gestalten/belt/crypto.js";\n',
            'import * as crypto from "../gestalten/belt/crypto.js";\n'
            'import { Vector } from "../prototypes/vector.js";\n',
            1,
        ),
        (
            'export default {\n  type: "view",',
            'const twitch = new Vector().open("/before/datamap/migrate/2026.11.0", (ctx) =>\n'
            '  ctx.migrate.renaming("View", "Surface"),\n'
            ');\n\nexport default {\n  type: "view",',
            1,
        ),
        ("  repository: ViewRepository,\n};", "  repository: ViewRepository,\n  twitch,\n};", 1),
    ],
}

AFTER = {
    "subsystems/typology/entities/Mode.ts": [
        (
            'import { FileEntity } from "./index.ts";\n',
            'import { FileEntity } from "./index.ts";\nimport { Vector } from "../prototypes/vector.js";\n',
            1,
        ),
        (
            'export default {\n  type: "mode",',
            'const twitch = new Vector().open("/after/datamap/migrate/2026.11.0", (ctx) =>\n'
            '  ctx.migrate.mapping("Mode", (mode) => ({\n'
            '    traits: mode.traits.map(\n'
            '      (word) => ({ VIEWABLE: "SURFACED", GENERATIVE: "SURFACING" })[word] ?? word,\n'
            '    ),\n'
            '  })),\n'
            ');\n\nexport default {\n  type: "mode",',
            1,
        ),
        ("  repository: ModeRepository,\n};", "  repository: ModeRepository,\n  twitch,\n};", 1),
    ],
    "commons/instances/hello-world/tests/draw.snapshot.test.js": [("        generator: {\n", "        surface: {\n", 1)],
    "commons/instances/hello-world/tests/emitter.test.js": [("    generator: {\n", "    surface: {\n", 1)],
}

MOVES = [
    ("subsystems/typology/entities/View.ts", "subsystems/typology/entities/Surface.ts"),
    ("subsystems/typology/schematics/entities/view.js", "subsystems/typology/schematics/entities/surface.js"),
    (
        "subsystems/typology/tests/view-entity.snapshot.test.js",
        "subsystems/typology/tests/surface-entity.snapshot.test.js",
    ),
    (
        "systems/runtime/subjects/mode/traits/viewable.js",
        "systems/runtime/subjects/mode/traits/surfaced.js",
    ),
    ("systems/runtime/gestalten/primer/view.js", "systems/runtime/gestalten/primer/surface.js"),
    ("systems/runtime/tests/entities/view.test.js", "systems/runtime/tests/entities/surface.test.js"),
    (
        "systems/runtime/tests/runtime/view.lifecycle.test.js",
        "systems/runtime/tests/runtime/surface.lifecycle.test.js",
    ),
    (
        "systems/runtime/tests/runtime/view.walk.test.js",
        "systems/runtime/tests/runtime/surface.walk.test.js",
    ),
    ("systems/runtime/tests/scenarios/viewed.js", "systems/runtime/tests/scenarios/surfaced.js"),
    (
        "systems/runtime/subjects/mode/traits/generative.js",
        "systems/runtime/subjects/mode/traits/surfacing.js",
    ),
    ("systems/runtime/gestalten/tools/generative.js", "systems/runtime/gestalten/tools/surfacing.js"),
    ("systems/runtime/tests/mode/generative.test.js", "systems/runtime/tests/mode/surfacing.test.js"),
    ("systems/ghost/entities/view", "systems/ghost/entities/surface"),
    ("systems/ghost/gestalten/belt/view.js", "systems/ghost/gestalten/belt/surface.js"),
    (
        "systems/ghost/tests/gestalten/belt/view.test.js",
        "systems/ghost/tests/gestalten/belt/surface.test.js",
    ),
    (
        "systems/anima/src/skins/chrome/widgets/buffer/view.js",
        "systems/anima/src/skins/chrome/widgets/buffer/surface.js",
    ),
    (
        "systems/anima/src/skins/chrome/panels/frame/view.jsx",
        "systems/anima/src/skins/chrome/panels/frame/surface.jsx",
    ),
    ("testament/_bruno/system/attached/view", "testament/_bruno/system/attached/surface"),
    ("testament/_bruno/system/mode/viewable/view.bru", "testament/_bruno/system/mode/viewable/surface.bru"),
    ("testament/_bruno/system/mode/viewable", "testament/_bruno/system/mode/surfaced"),
]
