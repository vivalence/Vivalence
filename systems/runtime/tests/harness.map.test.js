import { join } from "@std/path";
import { belt, Path, specimen, Vector } from "@vivalence/typology";
import { gestalten } from "@vivalence/runtime";
import { accio } from "./scenarios/registry.js";

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

const FS = "/runtime/runtime/mode/harness/runtime/fs";
const HARVEST = "/daemon/education/mode/tactic/harvest";

const world = async () => {
  const harness = await accio("@commons/harness/runtime");
  const harvest = {
    manifest: { type: "tactic", slug: "harvest" },
    tools: new Vector().open({ nature: "/drain", valence: "Writes the dataset." }, () => ({ output: {} })),
    primer: new Vector().open({ nature: "archivist", valence: "the harvest persona", load: "lazy" }, "ARCHIVIST"),
  };
  const francesca = {
    manifest: { type: "teacher", slug: "francesca" },
    tools: new Vector().open({ nature: "/drill", valence: "Deals a drill." }, () => ({ output: {} })),
    primer: new Vector()
      .open({ nature: "role", valence: "who she is" }, "You are Francesca.")
      .open({ nature: "grammar", valence: "her grammar notes", load: "lazy" }, "Passato prossimo first.")
      .open({ nature: "drills", valence: "her drills" }, new Vector().open({ nature: "conjugation", valence: "verb tables" }, "Avere first.")),
  };
  const education = { reference: new Path("/daemon/education"), modes: { tactic: { harvest }, teacher: { francesca } } };
  const runtimeMode = { manifest: harness.manifest, tools: harness.tools, primer: harness.primer };
  const runtime = {
    reference: new Path("/runtime/runtime"),
    modes: { harness: { runtime: runtimeMode } },
    daemons: { education },
  };
  return {
    francesca: { runtime, daemon: education, reference: education.reference, mode: francesca },
    harvest: { runtime, daemon: education, reference: education.reference, mode: harvest },
    "harness/runtime": { runtime, reference: runtime.reference, mode: runtimeMode },
  };
};

const DELTA = {
  TOOLED: { [FS]: "eager", [`${FS}/delete`]: "none", [HARVEST]: "lazy" },
  PRIMED: { [`${HARVEST}/archivist`]: "eager" },
};

const served = (ctx, delta, slugging = "deep") => {
  const home = gestalten.reference.home(ctx);
  const index = gestalten.reference.index(ctx);
  return {
    home,
    TOOLED: belt.reference.fold(delta.TOOLED, home, index.TOOLED, slugging),
    PRIMED: belt.reference.fold(delta.PRIMED, home, index.PRIMED, slugging),
  };
};

const brief = (map) => ({
  home: map.home,
  TOOLED: map.TOOLED.filter((entry) => !entry.reference.startsWith(`${FS}/`) || entry.key !== null).map(
    ({ reference, state, key, offered, name }) => ({ reference, state, key, offered, name }),
  ),
  PRIMED: map.PRIMED.map(({ reference, state, key, offered, name, load }) => ({ reference, state, key, offered, name, load })),
  tally: { TOOLED: belt.reference.tally(map.TOOLED), PRIMED: belt.reference.tally(map.PRIMED) },
});

specimen.describe("the served map — index × thread delta × home, folded by typology for both clients", () => {
  specimen.it("the fold per home, whole: every entry's state · key · offered · name", async () => {
    const homes = await world();
    const maps = Object.fromEntries(Object.entries(homes).map(([label, ctx]) => [label, brief(served(ctx, DELTA))]));
    console.log(JSON.stringify(maps, null, 2));
    if (HOT) specimen.snapshot(maps, { base: SNAPSHOTS, locate: "harness-map.snapshot.json", parse: (value) => value });
    specimen.expect(maps).toEqual(JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, "harness-map.snapshot.json"))));
    const francesca = served(homes.francesca, DELTA);
    const at = (trait, reference) => francesca[trait].find((entry) => entry.reference === reference);
    specimen.expect(at("TOOLED", `${FS}/read`)).toMatchObject({ state: "eager", key: FS, offered: "none", name: "/runtime/harness/runtime/fs/read" });
    specimen.expect(at("TOOLED", `${FS}/delete`)).toMatchObject({ state: "none", key: `${FS}/delete` });
    specimen.expect(at("TOOLED", `${HARVEST}/drain`)).toMatchObject({ state: "lazy", key: HARVEST, name: "/tactic/harvest/drain" });
    specimen.expect(at("TOOLED", "/daemon/education/mode/teacher/francesca/drill")).toMatchObject({ state: "eager", key: null, offered: "eager", name: "/drill" });
    specimen.expect(at("PRIMED", "/daemon/education/mode/teacher/francesca/grammar")).toMatchObject({ state: "lazy", offered: "lazy", name: "/grammar" });
    specimen.expect(at("PRIMED", `${HARVEST}/archivist`)).toMatchObject({ state: "eager", key: `${HARVEST}/archivist` });
  });

  specimen.it("I move home to tactic/harvest: every name re-narrowed, no keyed state changed", async () => {
    const homes = await world();
    const before = served(homes.francesca, DELTA);
    const after = served(homes.harvest, DELTA);
    const keyed = (map) => map.TOOLED.filter((entry) => entry.key !== null).map(({ reference, state }) => ({ reference, state }));
    const renamed = after.TOOLED.filter((entry, index) => entry.name !== before.TOOLED[index].name).length;
    console.log(JSON.stringify({ renamed, of: after.TOOLED.length, keyed: keyed(after) }, null, 2));
    specimen.expect(keyed(after)).toEqual(keyed(before));
    specimen.expect(after.TOOLED.find((entry) => entry.reference === `${HARVEST}/drain`).name).toBe("/drain");
    specimen.expect(renamed).toBe(2);
  });

  specimen.it("Q19 · slugging nested: the home's own tools and sections move behind its slug, no other name moves", async () => {
    const homes = await world();
    const deep = served(homes.francesca, DELTA, "deep");
    const nested = served(homes.francesca, DELTA, "nested");
    const moved = (trait) =>
      nested[trait]
        .map((entry, index) => ({ reference: entry.reference, deep: deep[trait][index].name, nested: entry.name }))
        .filter((entry) => entry.deep !== entry.nested);
    console.log(JSON.stringify({ TOOLED: moved("TOOLED"), PRIMED: moved("PRIMED") }, null, 2));
    specimen.expect(moved("TOOLED")).toEqual([
      { reference: "/daemon/education/mode/teacher/francesca/drill", deep: "/drill", nested: "/teacher/francesca/drill" },
    ]);
    specimen.expect(moved("PRIMED").map((entry) => entry.nested)).toEqual([
      "/teacher/francesca/role",
      "/teacher/francesca/grammar",
      "/teacher/francesca/drills/conjugation",
    ]);
  });

  specimen.it("a nested primer section: the index lists it, found reaches it by its own reference", async () => {
    const homes = await world();
    const ctx = { ...homes.francesca, thread: { trait: { HARNESSED: { slugging: "deep" } } } };
    const reference = "/daemon/education/mode/teacher/francesca/drills/conjugation";
    const listed = gestalten.reference.index(ctx).PRIMED.find((entry) => entry.reference === reference);
    const reached = gestalten.reference.found(ctx, reference, (mode) => mode.primer);
    console.log(JSON.stringify({ listed, reached: reached.map((entry) => ({ reference: entry.reference, valence: entry.pattern.valence })) }, null, 2));
    specimen.expect(listed).toEqual({ reference, valence: "verb tables", load: "eager" });
    specimen.expect(reached.map((entry) => entry.reference)).toEqual([reference]);
  });

  specimen.it("the verbs — one reducer for the runtime's write and the clients' preview, decided by the nearest key", () => {
    const home = "/daemon/education/mode/teacher/francesca";
    const delta = DELTA.TOOLED;
    const verbs = {
      "preload under a nearer none lists it": belt.reference.preloaded(delta, home, `${FS}/delete`),
      "preload under eager changes nothing": belt.reference.preloaded(delta, home, `${FS}/read`) === delta,
      "preload of the home's own tool changes nothing": belt.reference.preloaded(delta, home, `${home}/drill`) === delta,
      "unload under a kept key writes none": belt.reference.unloaded(delta, home, `${FS}/read`),
      "unload of a key drops it and every key under it": belt.reference.unloaded(delta, home, FS),
      "unload of the home's own default writes none": belt.reference.unloaded(delta, home, `${home}/drill`),
      "unload of what nothing carries changes nothing": belt.reference.unloaded({}, home, `${FS}/read`),
    };
    console.log(JSON.stringify(verbs, null, 2));
    specimen.expect(verbs["preload under a nearer none lists it"][`${FS}/delete`]).toBe("lazy");
    specimen.expect(verbs["preload under eager changes nothing"]).toBe(true);
    specimen.expect(verbs["preload of the home's own tool changes nothing"]).toBe(true);
    specimen.expect(verbs["unload under a kept key writes none"]).toEqual({ ...delta, [`${FS}/read`]: "none" });
    specimen.expect(verbs["unload of a key drops it and every key under it"]).toEqual({ [HARVEST]: "lazy" });
    specimen.expect(verbs["unload of the home's own default writes none"]).toEqual({ ...delta, [`${home}/drill`]: "none" });
    specimen.expect(verbs["unload of what nothing carries changes nothing"]).toEqual({});
  });

  specimen.it("changes — the comp's preview line: /tool/unload …/harness/runtime/fs, 6 tools leave the map", async () => {
    const homes = await world();
    const before = served(homes.francesca, DELTA);
    const { [FS]: _fs, [`${FS}/delete`]: _delete, ...kept } = DELTA.TOOLED;
    const after = served(homes.francesca, { ...DELTA, TOOLED: kept });
    const changed = belt.reference.changes(before.TOOLED, after.TOOLED);
    console.log(JSON.stringify(changed, null, 2));
    specimen.expect(changed.length).toBe(6);
    specimen.expect(changed.every((change) => change.before === "eager" && change.after === "none")).toBe(true);
  });
});
