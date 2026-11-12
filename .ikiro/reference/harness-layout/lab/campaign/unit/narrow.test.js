import { specimen, ToolCall } from "@vivalence/typology";
import { absolute, GRAMMAR, homes, leafReferences, mode, named, natures, print, PROBES, world } from "../lib/world.js";

const { narrow, readings, found } = await import(`${PROBES}/load.test.js`);

const home = (entry) => ({ host: entry.host.reference, mode: absolute(entry.host, entry.mode) });
const ctxOf = (runtime, entry) => ({ runtime, daemon: entry.host, mode: entry.mode });

const sweep = (runtime) => {
  const held = leafReferences(runtime);
  const rows = [];
  for (const entry of homes(runtime)) {
    const ctx = ctxOf(runtime, entry);
    for (const reference of held) {
      const short = narrow(home(entry), reference);
      const name = named(short);
      const typed = new ToolCall(name).signal.absolute;
      const widened = found(ctx, `/${typed.join("/")}`).map((match) => match.reference);
      rows.push({ home: entry.label, reference, short, name, chars: name.length, widened });
    }
  }
  const collisions = [];
  for (const entry of homes(runtime)) {
    const mine = rows.filter((row) => row.home === entry.label);
    const byName = Object.groupBy(mine, (row) => row.name);
    for (const [name, group] of Object.entries(byName))
      if (group.length > 1) collisions.push({ home: entry.label, name, references: group.map((row) => row.reference) });
  }
  const roundTrip = rows.filter((row) => !(row.widened.length === 1 && row.widened[0] === row.reference));
  const overlong = rows.filter((row) => row.chars > 64);
  const grammar = rows.filter((row) => !GRAMMAR.test(row.name));
  return { held, rows, collisions, roundTrip, overlong, grammar };
};

const report = (label, result) => {
  print(`${label} · references`, result.held);
  print(
    `${label} · every (home × reference) → short → name → widened`,
    result.rows.map((row) => `${row.home}  ${row.reference}\n    short ${row.short}  name ${row.name} (${row.chars})\n    widened ${JSON.stringify(row.widened)}`).join("\n"),
  );
  print(`${label} · denominator`, `${result.rows.length} pairs · ${new Set(result.rows.map((row) => row.home)).size} homes`);
  print(`${label} · collisions (name shared inside one home)`, result.collisions);
  print(`${label} · round-trip failures (widen(name) ≠ {reference})`, result.roundTrip);
  print(`${label} · names > 64 chars`, result.overlong.map((row) => ({ home: row.home, name: row.name, chars: row.chars })));
  print(`${label} · names off /^[a-zA-Z0-9_-]{1,64}$/`, result.grammar.map((row) => ({ home: row.home, name: row.name })));
};

const CLEAN = () =>
  world(
    [mode("harness", "runtime", ["/fs/read", "/fs/write"]), mode("guide", "editor", ["/open"])],
    {
      education: [mode("teacher", "francesca", ["/drill"]), mode("tactic", "harvest", ["/drain"])],
      chess: [mode("teacher", "francesca", ["/drill"]), mode("teacher", "coach", ["/whoami"])],
    },
  );

specimen.describe("L1 narrow ⟷ widen — a total function over (home × reference)", () => {
  specimen.it("clean world: unique per home, round trip through the provider NAME, ≤64, grammar", () => {
    const result = sweep(CLEAN());
    report("clean", result);
    specimen.expect(result.collisions).toEqual([]);
    specimen.expect(result.roundTrip).toEqual([]);
    specimen.expect(result.overlong).toEqual([]);
    specimen.expect(result.grammar).toEqual([]);
  });

  specimen.it("MISSING · a daemon mode of TYPE runtime collides with the runtime marker", () => {
    const runtime = world([mode("harness", "runtime", ["/fs/read"])], {
      education: [mode("teacher", "francesca", ["/drill"]), mode("runtime", "harness", ["/runtime/fs/read"])],
    });
    const result = sweep(runtime);
    report("type=runtime", result);
    specimen.expect(result.collisions).toEqual([]);
  });

  specimen.it("MISSING · a mode of TYPE daemon collides with the daemon marker", () => {
    const runtime = world([mode("daemon", "chess", ["/teacher/coach/whoami"]), mode("harness", "runtime", ["/x"])], {
      chess: [mode("teacher", "coach", ["/whoami"])],
    });
    const result = sweep(runtime);
    report("type=daemon", result);
    specimen.expect(result.collisions).toEqual([]);
  });

  specimen.it("MISSING · a tool path shadowing a sibling's type/slug", () => {
    const runtime = world([], {
      education: [mode("teacher", "francesca", ["/tactic/harvest/drain"]), mode("tactic", "harvest", ["/drain"])],
    });
    const result = sweep(runtime);
    report("shadow", result);
    specimen.expect(result.collisions).toEqual([]);
  });

  specimen.it("MISSING · a tool path equal to a sibling TYPE: typing the tool widens to every mode of that type too", () => {
    const runtime = world([], {
      education: [mode("teacher", "francesca", ["/tactic"]), mode("tactic", "harvest", ["/drain"]), mode("tactic", "sow", ["/plant"])],
    });
    const entry = homes(runtime).find((held) => held.label === "/daemon/education/mode/teacher/francesca");
    const matched = found(ctxOf(runtime, entry), "/tactic").map((match) => match.reference);
    print("found(francesca, '/tactic') — her own tool's short name", matched);
    specimen.expect(matched).toEqual(["/daemon/education/mode/teacher/francesca/tactic"]);
  });

  specimen.it("an underscore in a slug or nature: the provider name does not widen back", () => {
    const runtime = world([mode("harness", "runtime", ["/fs_read"])], {
      young_ladys: [mode("teacher", "primer_tutor", ["/drill"])],
    });
    const result = sweep(runtime);
    report("underscore", result);
    specimen.expect(result.roundTrip).toEqual([]);
  });

  specimen.it("MISSING · a loud throw on a tool name over 64 chars (cross-daemon, deep)", () => {
    const runtime = world([mode("harness", "runtime", ["/x"])], {
      education: [mode("teacher", "francesca", ["/drill"])],
      "young-ladys-primer": [mode("companion", "nell-illustrated", ["/chapter/illustration/regenerate/variant"])],
    });
    const result = sweep(runtime);
    report("deep", result);
    let thrown = null;
    try {
      for (const row of result.overlong) narrow({ host: "/daemon/education", mode: "/daemon/education/mode/teacher/francesca" }, row.reference);
    } catch (error) {
      thrown = error.message;
    }
    print("narrow over an over-64 name threw", thrown);
    specimen.expect(result.overlong.length > 0 && thrown !== null).toBe(true);
  });

  specimen.it("readings: what the widen tries, per home, for each marker form", () => {
    const runtime = CLEAN();
    const entry = homes(runtime).find((held) => held.label === "/daemon/education/mode/teacher/francesca");
    const ctx = ctxOf(runtime, entry);
    const table = Object.fromEntries(
      ["/drill", "/tactic/harvest/drain", "/runtime/harness/runtime/fs", "/runtime", "/daemon/chess/teacher/coach", "/daemon/chess"].map((short) => [
        short,
        { readings: readings(ctx, short), found: found(ctx, short).map((match) => match.reference) },
      ]),
    );
    print("readings from education·francesca", table);
    specimen.expect(table["/runtime"].found).toEqual(["/runtime/runtime/mode/harness/runtime", "/runtime/runtime/mode/guide/editor"]);
    specimen.expect(natures("/a//b")).toEqual(["a", "b"]);
  });
});
