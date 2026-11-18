import sys
R = sys.argv[1]
def sub(path, pairs):
    p = f"{R}/{path}"; s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (path, a[:70], s.count(a)); s = s.replace(a, b)
    open(p, "w").write(s)
sub("subsystems/typology/schematics/primitives/hallucination.js", [(
'''  via: v.record(v.string(), v.unknown()),
});
''',
'''  via: v.record(v.string(), v.unknown()),
});

export const FacultyRecipe = v.object(
  { id: v.string(), tier: Tier.optional() },
  { additionalProperties: true },
);

export const FacultyMask = v.object(
  { type: v.string(), id: v.string(), tier: Tier.optional() },
  { additionalProperties: true },
);
''')])
I = "subsystems/typology/schematics/primitives/instance.js"
p = f"{R}/{I}"; rows = open(p).read().split("\n")
start = rows.index('const StaticsRecipe = v.object({}, { additionalProperties: true });')
stop = rows.index("// a ledger's word: what every instance on it inherits, slot by slot, unless it declares the slot")
assert rows[start - 1].startswith("const Reference = "), rows[start - 1]
ledger = rows.index("export const LedgerRecipe = v.object(")
end = next(i for i in range(ledger, len(rows)) if rows[i] == ");")
RECIPES = '''export const StaticsRecipe = v.object({}, { additionalProperties: true });
export const SecretsRecipe = v.record(v.string(), Reference("SECRET_"));

export const Recipe = v.object(
  { module: v.string(), statics: StaticsRecipe.optional(), secrets: SecretsRecipe.optional() },
  { additionalProperties: true },
);

export const HallucinatorRecipe = v.object(
  {
    module: v.string(),
    statics: StaticsRecipe.optional(),
    secrets: SecretsRecipe.optional(),
    faculties: v.array(FacultyRecipe),
  },
  { additionalProperties: true },
);

export const DatamapRecipe = v.object(
  { module: v.string(), statics: StaticsRecipe.optional(), secrets: SecretsRecipe.optional() },
  { additionalProperties: true },
);

export const ModeRecipe = v.object(
  {
    module: v.string(),
    manifest: v.object({}, { additionalProperties: true }).optional(),
    mountpoint: v.union([v.string(), v.null()]).optional(),
    statics: StaticsRecipe.optional(),
    secrets: SecretsRecipe.optional(),
    consume: v.record(v.string(), Recipe).optional(),
    hallucinators: v.array(HallucinatorRecipe).optional(),
  },
  { additionalProperties: false },
);

export const ModeRecipes = v.array(v.union([v.string(), ModeRecipe]));

const Environment = v.object(
  {
    type: v.const("object"),
    properties: v.record(v.string(), v.object({}, { additionalProperties: true })),
    required: v.array(v.string()).optional(),
    additionalProperties: v.boolean().optional(),
  },
  { additionalProperties: false },
);

export const RuntimeRecipe = v.object(
  {
    manifest: v.object({ slug: Slug }, { additionalProperties: true }).optional(),
    statics: StaticsRecipe.optional(),
    secrets: v.object({ jwt: Reference("SECRET_") }).optional(),
    modes: ModeRecipes.optional(),
    hallucinators: v.array(HallucinatorRecipe).optional(),
  },
  { additionalProperties: false },
);

export const LighthouseRecipe = v.object(
  {
    secrets: v.object({ jwt: Reference("SECRET_") }),
    traits: v.array(v.enum(LighthouseTraitsEnum)).optional(),
    trait: LighthouseTrait.optional(),
  },
  { additionalProperties: false },
);

export const ClientRecipe = v.object(
  {
    manifest: Manifest,
    module: v.string().optional(),
    mountpoint: v.string().optional(),
    statics: StaticsRecipe.optional(),
    modes: ModeRecipes.optional(),
    trait: ClientTrait.optional(),
  },
  { additionalProperties: false },
);

export const ServiceRecipe = v.object(
  {
    manifest: Manifest,
    module: v.string(),
    mountpoint: v.string().optional(),
    statics: StaticsRecipe.optional(),
    secrets: SecretsRecipe.optional(),
    datamap: DatamapRecipe.optional(),
    hallucinators: v.array(HallucinatorRecipe).optional(),
  },
  { additionalProperties: false },
);

export const DaemonRecipe = v.object(
  {
    manifest: Manifest,
    mountpoint: v.string().optional(),
    statics: StaticsRecipe.optional(),
    reference: v.string().optional(),
    modes: ModeRecipes.optional(),
    consume: v.record(v.string(), Recipe).optional(),
    hallucinators: v.array(HallucinatorRecipe).optional(),
  },
  { additionalProperties: false },
);

export const InstanceRecipe = v.object(
  {
    manifest: Manifest,
    environment: Environment.optional(),
    runtime: RuntimeRecipe.optional(),
    lighthouse: LighthouseRecipe.optional(),
    datamap: DatamapRecipe.optional(),
    clients: v.array(ClientRecipe).optional(),
    services: v.array(ServiceRecipe).optional(),
    daemons: v.array(DaemonRecipe).optional(),
  },
  { additionalProperties: false },
);
'''.split("\n")
LEDGER = '''export const LedgerRecipe = v.object(
  {
    manifest: Manifest,
    environment: v.object({}, { additionalProperties: true }).optional(),
    runtime: RuntimeRecipe.optional(),
    lighthouse: LighthouseRecipe.optional(),
    datamap: DatamapRecipe.optional(),
    hallucinators: v.array(HallucinatorRecipe).optional(),
    clients: v.array(ClientRecipe).optional(),
    services: v.array(ServiceRecipe).optional(),
  },
  { additionalProperties: true },
);'''.split("\n")
rows = rows[:start] + RECIPES + rows[stop:ledger] + LEDGER + rows[end + 1:]
open(p, "w").write("\n".join(rows))
text = open(p).read()
assert text.count("StaticsMask().") == 5, text.count("StaticsMask().")
open(p, "w").write(text.replace("StaticsMask().", "StaticsMask."))
sub(I, [
('const StaticsMask = (known = {}) => v.object(known, { additionalProperties: true });', 'export const StaticsMask = v.object({}, { additionalProperties: true });'),
('const SecretsMask = v.record(v.string(), v.unknown());', 'export const SecretsMask = v.record(v.string(), v.unknown());'),
('statics: StaticsMask({ db: v.object({ file: v.string() }).optional() }).default({}),', 'statics: v.object({ db: v.object({ file: v.string() }).optional() }, { additionalProperties: true }).default({}),'),
('statics: StaticsMask({ serve: Url().optional() }).default({}),', 'statics: v.object({ serve: Url().optional() }, { additionalProperties: true }).default({}),'),
('    statics: StaticsMask({\n', '    statics: v.object({\n'),
('.optional(),\n    }),\n    secrets: v.object({ jwt: v.string({ minLength: 24 }).desc("The lighthouse slot', '.optional(),\n    }, { additionalProperties: true }),\n    secrets: v.object({ jwt: v.string({ minLength: 24 }).desc("The lighthouse slot'),
('import { Tier } from "./hallucination.js";', 'import { FacultyMask, FacultyRecipe } from "./hallucination.js";'),
('''    faculties: v.array(
      v.object(
        { type: v.string(), id: v.string(), tier: Tier.optional() },
        { additionalProperties: true },
      ),
    ),
''', '''    faculties: v.array(FacultyMask),
'''),
])
