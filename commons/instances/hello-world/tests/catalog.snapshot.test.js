import { join } from "@std/path";
import { belt, specimen, steer, Vector } from "@vivalence/typology";
import { traits } from "@vivalence/runtime";
const { SURFACING } = traits.mode;
import { tools } from "../mode.viva.js";

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

const pin = (subject, file) => {
  const pojo = JSON.parse(JSON.stringify(subject));
  if (HOT) {
    specimen.snapshot(pojo, {
      base: SNAPSHOTS,
      locate: file,
      parse: (value) => value,
    });
  }
  const frozen = JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file)));
  specimen.expect(pojo).toEqual(frozen);
  return pojo;
};

// hallucination.js:26-32, reproduced — it is local to Hallucination(), so a snapshot of what
// actually crosses the wire has to spell it out rather than import it.
const declarations = (vector) =>
  steer.trie.leaves(vector).map(({ pattern, steps }) => ({
    name: belt.hallucinate.nameOf(steps),
    ...(pattern.valence && { valence: pattern.valence }),
    ...(pattern.input && { input: pattern.input }),
  }));

// generative.js then tooling.js, in manifest order — both graft onto mode.tools, the one
// catalog harnessed.js arms. `tools` alone is NOT what reaches the model.
const surfacing = {
  manifest: { slug: "hello-world", type: "demo" },
  module: {},
  mountpoint: "/nonexistent/catalog",
  entity: { id: "mode-1" },
  tools: new Vector(),
};
await SURFACING(surfacing, { entities: {} });
surfacing.tools.graft(tools);
const catalog = () => surfacing.tools;

// harnessed.js armory, a bare HARNESSED mode: no services, no domain — the mode's own only.
const armory = () => declarations(new Vector().graft(catalog())).map(({ name }) => name);

specimen.describe(
  "hello-world catalog snapshot — what crosses the wire",
  () => {
    specimen.it(
      "S1: the mode's own declarations in full — name, valence, input schema",
      () => {
        const pinned = pin(
          declarations(catalog()),
          "hello-world-catalog.snapshot.json",
        );
        // five from the trait first (GENERATIVE precedes TOOLING), then four of its own and
        // eight imported from the runtime; buffer_update · buffer_label join the trait's buffer.
        specimen.expect(pinned.map(({ name }) => name)).toEqual([
          "buffer_create",
          "buffer_update",
          "buffer_label",
          "surface_create",
          "surface_update",
          "surface_read",
          "surface_list",
          "viva_doctor",
          "web_search",
          "web_read",
          "research",
          "entity_schema",
          "entity_find",
          "entity_count",
          "entity_update",
          "thread_update",
          "mode_find",
        ]);
      },
    );

    specimen.it(
      "S1: the FULL armory as names only — a paladin tools change is a one-line diff",
      () => {
        pin(armory(), "hello-world-armory.snapshot.json");
      },
    );
  },
);
