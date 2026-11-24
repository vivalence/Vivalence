# limit: 4000 chars · re-applies my anchored edits onto the two files the sibling session edited after the sandbox copy: python3 drift.py <repo> [--dry]
import sys
ROOT = sys.argv[1]
DRY = len(sys.argv) > 2 and sys.argv[2] == "--dry"
EDITS = {
  "systems/anima/src/surfaces/chrome/panels/sidebar/sections.js": [
    ('import { belt as typology, is, mime, Signal, steer, tiers, v, Vector } from "@vivalence/typology";',
     'import { belt as typology, is, mime, Signal, steer, v, Vector } from "@vivalence/typology";', 1),
    ('  model: undefined,\n  models: [],\n};', '  model: undefined,\n  models: [],\n  tiers: {},\n};', 1),
    ('    models: cortex.find({ type: "dialogue", via: "stream" }),\n  };\n};',
     '    models: cortex.find({ type: "dialogue", via: "stream" }),\n    tiers: cortex.tiers,\n  };\n};', 1),
    ('  return Object.hasOwn(tiers, held.tier) ? tiers[held.tier] : null;',
     '  return Object.hasOwn(held.tiers, held.tier) ? held.tiers[held.tier] : null;', 1),
    ('export const TIERS = ["frugal", "fast", "balanced", "capable", "unleashed", "eager"];',
     'export const TIERS = ["frugal", "fast", "balanced", "capable", "unleashed"];', 1),
  ],
  "systems/anima/tests/harness.surfaces.test.js": [
    ("new Cortex()", "new Cortex(TIER_POINTS)", None),
  ],
}
PREPEND = {"systems/anima/tests/harness.surfaces.test.js": 'import { TIER_POINTS } from "@vivalence/typology/scenarios";\n'}
for path, edits in EDITS.items():
    full = f"{ROOT}/{path}"
    text = open(full).read()
    for old, new, count in edits:
        found = text.count(old)
        if count is not None and found != count:
            raise SystemExit(f"ANCHOR {path}: expected {count}, found {found}: {old[:60]!r}")
        if found == 0:
            raise SystemExit(f"ANCHOR {path}: missing {old[:60]!r}")
        text = text.replace(old, new)
    if path in PREPEND and PREPEND[path] not in text:
        text = PREPEND[path] + text
    print(("would write " if DRY else "wrote ") + path)
    if not DRY:
        open(full, "w").write(text)
