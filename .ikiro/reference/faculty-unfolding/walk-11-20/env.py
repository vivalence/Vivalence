import sys
R = sys.argv[1]
def sub(path, pairs):
    p = f"{R}/{path}"; s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (path, a[:70], s.count(a)); s = s.replace(a, b)
    open(p, "w").write(s)
sub("subsystems/typology/schematics/primitives/instance.js", [
('export const SecretsMask = v.record(v.string(), v.unknown());\n', 'export const SecretsMask = v.record(v.string(), v.unknown());\nexport const EnvironmentMask = v.object({}, { additionalProperties: true });\n'),
('    environment: v.object({}, { additionalProperties: true }),\n', '    environment: EnvironmentMask,\n'),
('const Environment = v.object(\n', 'export const EnvironmentRecipe = v.object(\n'),
('    environment: Environment.optional(),\n', '    environment: EnvironmentRecipe.optional(),\n'),
('    environment: v.object({}, { additionalProperties: true }).optional(),\n', '    environment: EnvironmentRecipe.optional(),\n'),
])
sub("subsystems/typology/tests/schematics/instance.test.js", [
('"Hallucinator", "Statics", "Secrets"];', '"Hallucinator", "Statics", "Secrets", "Environment"];'),
])
