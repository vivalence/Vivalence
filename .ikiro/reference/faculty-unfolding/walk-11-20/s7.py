import sys
R, sentence = sys.argv[1], sys.argv[2]
def sub(path, pairs):
    p = f"{R}/{path}"; s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (path, a[:60], s.count(a)); s = s.replace(a, b)
    open(p, "w").write(s)
sub("subsystems/paladin/instance/lifecycle/3-integration.js", [
("  InstanceMask.cast(instance);\n  travel(instance);\n  const faults = [", "  InstanceMask.cast(instance);\n  const faults = ["),
("  if (!instance.faults.length) InstanceMask.decode(instance);\n}", "  if (instance.faults.length) return;\n  travel(instance);\n  InstanceMask.decode(instance);\n}"),
])
if sentence != "-":
    sub("subsystems/paladin/tests/settle.test.js", [
("\n  it(\"a trait declared without the faculties it needs is REPORTED", '''
  it("a mode entry whose traits are no list is a FAULT, said by the schematic — the travel runs on a clean instance alone", async () => {
    const instance = await mount(
      (paladin) => ({
        runtime: reaching(paladin),
        datamap: libsql,
        daemons: [daemon({ modes: [{ module: "@chess/game/board", manifest: { traits: 5 } }] })],
        environment,
      }),
      SET,
    );
    expect(instance.faults).toContain(SENTENCE);
  });

  it("a trait declared without the faculties it needs is REPORTED'''.replace("SENTENCE", repr(sentence).replace("'", '"'))),
    ])
