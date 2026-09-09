import { join } from "@std/path";
import { shard, specimen, steer, Vector } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import { GENERATIVE } from "@vivalence/runtime/daemon/traits";
import { generator, tools } from "../mode.viva.js";

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
  steer.trie.rollup(vector, () => null).map(({ pattern, steps }) => ({
    name: shard.hallucinate.nameOf(steps),
    ...(pattern.valence && { valence: pattern.valence }),
    ...(pattern.input && { input: pattern.input }),
  }));

// tooled.js:10 then harnessed.js — the mode's own tools plus the GENERATIVE trait's, with the
// mode's generator slurped onto them. `tools` alone is NOT what reaches the model.
const generative = {
  manifest: { slug: "hello-world", type: "demo" },
  module: { generator },
};
await GENERATIVE(generative, {
  mountpoint: { absolute: "/nonexistent/catalog" },
});
const catalog = () => {
  const armed = new Vector().slurp(tools);
  armed.branch("/generator").slurp(generative.generator.tools);
  return armed;
};

// harnessed.js:52-71, the layers a bare HARNESSED mode with a module mount actually gets:
// no entities, no services, no domain — paladin's two skill packs plus the mode's own.
const armory = () =>
  declarations(
    new Vector()
      .slurp(paladin.skills.fs)
      .slurp(paladin.skills.shell)
      .slurp(catalog()),
  ).map(({ name }) => name);

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
        // exactly four view names, the trait's. FIVE means the generator leaked a branch.
        // `research` sits where the assembly put it — after web, before the trait's tools.
        specimen.expect(pinned.map(({ name }) => name)).toEqual([
          "viva_doctor",
          "web_search",
          "web_read",
          "research",
          "generator_view_render",
          "generator_view_revise",
          "generator_view_inspect",
          "generator_view_list",
        ]);
      },
    );

    specimen.it(
      "S1: the FULL armory as names only — a paladin skills change is a one-line diff",
      () => {
        pin(armory(), "hello-world-armory.snapshot.json");
      },
    );
  },
);
