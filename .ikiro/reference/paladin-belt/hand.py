"""hand — the edits of the paladin belt quest no pattern can make, on a COPY, after tangle.py.

    python3 hand.py <copy of the repo>

Each edit is an exact text and must match once.
"""
import os, shutil, sys

here = os.path.dirname(os.path.abspath(__file__))
tree = os.path.abspath(sys.argv[1])
P = "subsystems/paladin/"


def edit(path, pairs):
    full = os.path.join(tree, path)
    text = open(full, encoding="utf-8").read()
    for old, new in pairs:
        if text.count(old) != 1:
            raise SystemExit(f"{path}: {text.count(old)} matches of {old[:70]!r}")
        text = text.replace(old, new)
    open(full, "w", encoding="utf-8").write(text)


os.remove(os.path.join(tree, P, "prototypes/lock.js"))
shutil.copyfile(
    os.path.join(here, "new", P, "prototypes/locks.js"),
    os.path.join(tree, P, "prototypes/locks.js"),
)

edit(P + "prototypes/index.js", [('export { Lock } from "./lock.js";', 'export { Locks } from "./locks.js";')])

edit(P + "ledger/prototype.js", [
    ('import { Lock } from "../prototypes/lock.js";\nimport { Log } from "../prototypes/log.js";\n',
     'import { Locks } from "../prototypes/locks.js";\n'),
    ("    this.paladin = paladin;\n  }\n\n  authored(source) {",
     "    this.paladin = paladin;\n    this.locks = new Locks(paladin);\n  }\n\n  authored(source) {"),
    ("""  lock(instance) {
    return new Lock(this.paladin, this.paladin.scope.ledger.branch(`/locks/${instance}.lock`));
  }

  async locks() {
    const home = this.paladin.scope.ledger.branch("locks").absolute;
    if (!(await Deno.stat(home).catch(() => null))) return [];
    const files = (await Array.fromAsync(Deno.readDir(home))).filter((entry) => entry.name.endsWith(".lock"));
    const held = await Promise.all(files.map((entry) => this.lock(entry.name.slice(0, -".lock".length)).read()));
    return held.filter(Boolean);
  }

  log(instance) {
    return new Log(this.paladin, instance);
  }

""", ""),
    ("for (const held of await this.locks()) {", "for (const held of await this.locks.list()) {"),
])

edit(P + "ledger/die.js", [
    ("    this.lock = this.instance ? this.ledger.lock(this.instance) : null;\n", ""),
    ("    if (!this.lock) return Promise.resolve();\n    return (this.writing = this.writing.then(() => this.lock.write(this.json)));",
     "    if (!this.instance) return Promise.resolve();\n    return (this.writing = this.writing.then(() =>\n      this.ledger.locks.write(this.instance, this.json)\n    ));"),
    ("    if (!this.lock) return;\n    this.vigil();\n    await this.writing;\n    const held = await this.lock.read();\n    if (held?.token === this.token) await this.lock.remove();",
     "    if (!this.instance) return;\n    this.vigil();\n    await this.writing;\n    const held = await this.ledger.locks.read(this.instance);\n    if (held?.token === this.token) await this.ledger.locks.remove(this.instance);"),
    ("    const held = await this.lock?.read();\n    if (held) {",
     "    const held = this.instance ? await this.ledger.locks.read(this.instance) : null;\n    if (held) {"),
])

edit(P + "prototypes/telemetry.js", [
    ('import { control, fn, Pattern, Signal, Span, sse, trace, v } from "@vivalence/typology";\n',
     'import { control, fn, Pattern, Signal, Span, sse, trace, v } from "@vivalence/typology";\nimport { Log } from "./log.js";\n'),
    ("  get logs() {\n    return this.paladin.telemetry.log(this.paladin.instance.manifest.slug).base;\n  }",
     "  log(instance) {\n    return new Log(this.paladin, instance);\n  }\n\n  get logs() {\n    return this.log(this.paladin.instance.manifest.slug).base;\n  }"),
    ("    this.paladin.state\n      .dir(this.logs)", "    this.paladin.write\n      .dir(this.logs)"),
])

edit(P + "prototypes/process.js", [
    ("await this.ledger.log(this.identity.instance)", "await this.ledger.paladin.telemetry.log(this.identity.instance)"),
])

edit(P + "mod.client.js", [
    ('import vault from "./gestalten/belt/vault.js";\nimport is from "./gestalten/belt/is.js";\nimport control from "./gestalten/belt/control.js";',
     'import { vault } from "./gestalten/belt/vault.js";\nimport { is } from "./gestalten/belt/is.js";\nimport { control } from "./gestalten/belt/control.js";'),
])

edit(P + "gestalten/index.js", [
    ('export { default as belt } from "./belt/index.js";', 'export * as belt from "./belt/index.js";'),
])

edit(P + "tests/source.test.js", [
    ('import source from "../gestalten/belt/source.js";', 'import { link } from "../gestalten/belt/link.js";'),
    ("source(paladin);\n\ndescribe(\"paladin.source\", () => {", "link(paladin);\n\ndescribe(\"paladin.link.path\", () => {"),
])

edit(P + "tests/expand.test.js", [
    ('describe("paladin.expand — a ${KEY}', 'describe("paladin.link.env — a ${KEY}'),
])

edit(P + "tests/bundler.test.js", [
    ('import { MEMBERS } from "../gestalten/belt/bundler.js";', 'import { MEMBERS } from "../gestalten/belt/bundle.js";'),
    ('describe("paladin.bundler", {', 'describe("paladin.bundle", {'),
])

edit(P + "tests/baked.test.js", [
    ('import vault from "../gestalten/belt/vault.js";\nimport scope from "../gestalten/belt/scope.js";',
     'import { vault } from "../gestalten/belt/vault.js";\nimport { scope } from "../gestalten/belt/scope.js";'),
])

edit(P + "tests/spawn.test.js", [
    ('    const lock = paladin.ledger.lock("watched");\n    await lock.write({', '    const locks = paladin.ledger.locks;\n    await locks.write("watched", {'),
    ('    assertEquals((await lock.read()).processes.map(', '    assertEquals((await locks.read("watched")).processes.map('),
    ('    await lock.write({ pid: Deno.pid, instance: "watched", status: "ALIVE", processes: [{ process: "runtime", pid: 4999999, status: "ALIVE" }] });\n    assertEquals(await lock.read(), null);\n    assertEquals(await paladin.read.json(lock.path, null), null);',
     '    await locks.write("watched", { pid: Deno.pid, instance: "watched", status: "ALIVE", processes: [{ process: "runtime", pid: 4999999, status: "ALIVE" }] });\n    assertEquals(await locks.read("watched"), null);\n    assertEquals(await paladin.read.json(locks.mount("watched"), null), null);'),
])

edit("systems/runtime/tests/scenarios/surfaced.js", [
    ("""  const bundler = paladin.bundler;
  paladin.bundler = Object.assign((...held) => {
    const made = bundler(...held);
    return {
      ...made,
      bundle: (input) => {
        builds.push(input.name);
        return made.bundle(input);
      },
    };
  }, bundler);
""", """  const unwatched = paladin.bundle.directory;
  paladin.bundle.directory = (...held) => {
    const made = unwatched(...held);
    return {
      ...made,
      bundle: (input) => {
        builds.push(input.name);
        return made.bundle(input);
      },
    };
  };
"""),
    ("      paladin.bundler = bundler;", "      paladin.bundle.directory = unwatched;"),
])

edit("testament/m82-clients-20261012/systems/ghost/lifecycle/client/trajectories/ledger/index.js", [
    ('const held = await ledger.lock(entry.name.slice(0, -".lock".length)).read();',
     'const held = await ledger.locks.read(entry.name.slice(0, -".lock".length));'),
])
edit(P + "tests/telemetry.test.js", [
    ("    ledger: { log: (slug) => ({ base: new Path(`${logs}/${slug}`) }) },\n    state: {",
     "    scope: { ledger: { branch: (path) => new Path(path.replace(/^\\/logs/, logs)) } },\n    write: {"),
])

edit(P + "tests/expand.test.js", [
    ('  it("expand has no scan — the mount\'s record is the only reading of a recipe", () => {\n    expect(mk().expand.scan).toBeUndefined();',
     '  it("link.env has no scan — the mount\'s record is the only reading of a recipe", () => {\n    expect(mk().link.env.scan).toBeUndefined();'),
])

edit(P + "tests/spawn.test.js", [
    ("    assertEquals(die.lock, null);", "    assertEquals(await paladin.ledger.locks.list(), []);"),
])

edit("testament/m82-clients-20261012/systems/ghost/belt/clone.js", [
    ("distinct from `paladin.clone`,", "distinct from `paladin.vcs.clone`,"),
])
print("hand edits landed")
