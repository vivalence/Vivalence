import { specimen, Vector, Datasink, project } from "@vivalence/typology";
import { datamap } from "@vivalence/runtime/scenarios";
import { topography } from "@vivalence/typology/scenarios";
import { DATASET, DATASINK } from "../daemon/traits/index.js";

const GENERATIONS = [
  { from: "dataset", into: "gen1", extension: "json" },
  { from: "gen1", into: "gen2", extension: "js" },
  { from: "gen2", into: "gen3", extension: "json" },
  { from: "gen3", into: "gen4", extension: "js" },
];

let mount, cycles;

const inventory = async (root, home) => {
  const found = new Map();
  const walk = async (dirname, prefix) => {
    for (const entry of Deno.readDirSync(dirname)) {
      const path = `${dirname}/${entry.name}`;
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory) await walk(path, relative);
      else found.set(relative.replace(/\.(json|js)$/, ""), await Deno.readTextFile(path));
    }
  };
  await walk(`${home}/${root}`, "");
  return found;
};

const dataspace = async (scenario) => {
  const dump = {};
  for (const [type, relation] of [["symbol", "literals"], ["literal", "symbols"]]) {
    const rows = await scenario.repos[type].find({}, { populate: [relation] });
    dump[type] = Datasink.canonical(rows.map(project.row([relation], ["slug", "traits", "trait", relation])));
  }
  return dump;
};

const cycle = async ({ from, into, extension }) => {
  const scenario = await datamap.seed();
  const daemon = {
    entities: scenario.repos,
    datamap: { introspect: () => scenario.orm.getMetadata() },
    twitch: new Vector(),
  };
  daemon.entities.em = scenario.em;

  const shape = topography.generation(from, into, extension);
  const mode = {
    type: "topography",
    slug: `gen-${into}`,
    entity: { installed: false },
    module: { mount: { dirname: mount }, dataset: shape.dataset, datasink: shape.datasink },
  };

  await DATASET(mode, daemon);
  DATASINK(mode, daemon);
  const report = await mode.datasink.drain({ all: true });
  const database = await dataspace(scenario);
  const files = await inventory(into, mount);
  await scenario.orm.close();

  return { into, extension, report, database, files };
};

specimen.beforeAll(async () => {
  const corpus = await topography.corpus();
  mount = corpus.dirname;
  cycles = [];
  for (const generation of GENERATIONS) cycles.push(await cycle(generation));
});

specimen.describe("ana — every generation installs to the SAME database", () => {
  specimen.it("reads its predecessor's emitted corpus, whatever format that was", () => {
    specimen.expect(cycles.map((each) => each.report.drained.sort().join("+")))
      .toEqual(["literal+symbol", "literal+symbol", "literal+symbol", "literal+symbol"]);
    for (const each of cycles) specimen.expect(each.report.written).toBeGreaterThan(0);
  });

  specimen.it("lands byte-identical dataspaces — js and json install to the same rows", () => {
    const [first] = cycles;
    for (const each of cycles.slice(1)) {
      specimen.expect(each.database.symbol).toBe(first.database.symbol);
      specimen.expect(each.database.literal).toBe(first.database.literal);
    }
  });

  specimen.it("carries the minted lemmas forward — they are declared corpus from gen1 on", () => {
    for (const each of cycles)
      for (const slug of ["word.lemma.casa", "word.lemma.del", "word.lemma.parlare"])
        specimen.expect(each.database.symbol).toContain(slug);
  });
});

specimen.describe("cata — every generation emits the SAME corpus", () => {
  specimen.it("writes the same file set each time, differing only in extension", () => {
    const names = cycles.map((each) => [...each.files.keys()].sort().join(","));
    specimen.expect(new Set(names).size).toBe(1);
    specimen.expect(names[0].split(",")).toEqual([
      "literals/sentences",
      "literals/words/adposition",
      "literals/words/determiner",
      "literals/words/noun",
      "literals/words/verb",
      "symbols/lemmas",
      "symbols/ontological",
      "symbols/structural",
    ]);
  });

  specimen.it("json → js → json is byte-identical at both json vantages", () => {
    const [gen1, , gen3] = cycles;
    for (const [name, text] of gen1.files) specimen.expect(gen3.files.get(name)).toBe(text);
  });

  specimen.it("js → json → js is byte-identical at both js vantages", () => {
    const [, gen2, , gen4] = cycles;
    for (const [name, text] of gen2.files) specimen.expect(gen4.files.get(name)).toBe(text);
  });

  specimen.it("differs between vantages by the codec envelope ALONE", () => {
    const [gen1, gen2] = cycles;
    for (const [name, json] of gen1.files) {
      const js = gen2.files.get(name);
      specimen.expect(js).toBe(`export default ${json.trimEnd()};\n`);
    }
  });
});

specimen.describe("the composite — cata ∘ ana is idempotent", () => {
  specimen.it("re-drains each generation to written: 0 against its own output", async () => {
    const scenario = await datamap.seed();
    const daemon = {
      entities: scenario.repos,
      datamap: { introspect: () => scenario.orm.getMetadata() },
      twitch: new Vector(),
    };
    daemon.entities.em = scenario.em;

    const shape = topography.generation("gen3", "gen4", "js");
    const mode = {
      type: "topography",
      slug: "gen-refix",
      entity: { installed: false },
      module: { mount: { dirname: mount }, dataset: shape.dataset, datasink: shape.datasink },
    };

    await DATASET(mode, daemon);
    DATASINK(mode, daemon);
    const again = await mode.datasink.drain({ all: true });
    specimen.expect(again.written).toBe(0);
    await scenario.orm.close();
  });
});
