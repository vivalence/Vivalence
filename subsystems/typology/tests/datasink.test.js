import { specimen, Dataset, Datasink, project, reader, writer } from "@vivalence/typology";
import { topography } from "@vivalence/typology/scenarios";

const dataset = topography.dataset();
const datasink = topography.datasink();
const symbols = [...topography.structural, ...topography.ontological];
const words = [...topography.nouns, ...topography.verbs];

specimen.describe("Dataset — what a module declares as its sources", () => {
  specimen.it("resolves declaration order into types and descriptors, never loaders", () => {
    specimen.expect(dataset.types).toEqual(["symbol", "literal"]);
    specimen.expect(dataset.sources.symbol[0]).toEqual({ read: "dataset/symbols/structural.js", codec: "data" });
    specimen.expect(dataset.sources.literal.at(-1)).toEqual({ walk: "dataset/literals/words" });
  });

  specimen.it("lifts a legacy { schema, entities } module without the module changing a line", () => {
    const legacy = new Dataset({ schema: {}, entities: { symbol: [{ slug: "inline" }] } });
    specimen.expect(legacy.types).toEqual(["symbol"]);
    specimen.expect(legacy.sources.symbol).toEqual([{ rows: [{ slug: "inline" }] }]);
  });

  specimen.it("mixes string, directory and inline sources in one declaration", () => {
    const mixed = new Dataset({ literal: ["dataset/literals/words", [{ slug: "synthetic" }]] });
    specimen.expect(mixed.sources.literal).toEqual([
      { walk: "dataset/literals/words" },
      { rows: [{ slug: "synthetic" }] },
    ]);
  });

  specimen.it("keeps a bare inline row array whole instead of reading each row as a source", () => {
    const inline = new Dataset({ symbol: [{ slug: "conjugation", traits: ["ONTOLOGICAL"] }] });
    specimen.expect(inline.sources.symbol).toEqual([
      { rows: [{ slug: "conjugation", traits: ["ONTOLOGICAL"] }] },
    ]);
  });

  specimen.it("is idempotent, so a trait may lift whatever the module exported", () => {
    specimen.expect(new Dataset(dataset)).toBe(dataset);
    specimen.expect(reader.lift("x.json")).toEqual({ read: "x.json", codec: "json" });
  });
});

specimen.describe("Datasink — what a module declares as its drains", () => {
  specimen.it("normalizes every tuple to the same five fields regardless of arity", () => {
    for (const sink of datasink.sinks)
      specimen.expect(Object.keys(sink).sort()).toEqual(["match", "shape", "target", "type", "where"]);
    const terse = new Datasink({ symbol: [["word", "out.json"]] });
    specimen.expect(terse.sinks[0].shape).toBe(null);
    specimen.expect(terse.sinks[0].target)
      .toEqual({ write: "out.json", codec: "json", keep: ["slug", "traits", "trait"] });
    specimen.expect(datasink.of("symbol")[0].shape).not.toBe(null);
  });

  specimen.it("keeps where as DATA for the DB but nulls it for a function selector", () => {
    specimen.expect(datasink.of("symbol")[0].where).toEqual({ slug: { $like: "word.lemma.%" } });
    const dynamic = new Datasink({ symbol: [[(row, ctx) => ctx.language === "it", "out.json"]] });
    specimen.expect(dynamic.sinks[0].where).toBe(null);
    specimen.expect(dynamic.sinks[0].match({ slug: "x" }, { language: "it" })).toBe(true);
  });

  specimen.it("refuses a declaration where two sinks write the same file", () => {
    specimen.expect(() => new Datasink({ symbol: [["word", "out.json"]], literal: [["word", "out.json"]] }))
      .toThrow(/two sinks write/);
    specimen.expect(() =>
      new Datasink({
        literal: [
          ["word", writer.split("word.part-of-speech.%", "words/%.json")],
          ["sentence", writer.split("sentence.kind.%", "words/%.json")],
        ],
      })
    ).not.toThrow();
  });

  specimen.it("leaves nothing unclaimed — every declared symbol reaches exactly one sink", () => {
    const rows = symbols.map(project.row([]));
    for (const row of rows) specimen.expect(datasink.concerns("symbol", row, {}).length).toBe(1);
  });

  specimen.it("recurses the sink algebra onto refs — lemma refs to slugs, root symbol dropped", () => {
    const shape = project.pipe(
      project.row(["symbols"]),
      project.refs("symbols", [
        [{ slug: { $like: "word.lemma.%" } }, project.slug],
        [{ slug: "word" }, project.drop],
      ]),
    );
    const casa = shape(topography.nouns.find((row) => row.slug === "casa.noun"));
    specimen.expect(casa.symbols.map((item) => item.slug))
      .toEqual(["proficiency.cefr.a1", "word.lemma.casa", "word.part-of-speech.noun"]);
    specimen.expect(casa.symbols.find((item) => item.slug === "word.lemma.casa"))
      .toEqual({ slug: "word.lemma.casa" });
  });
});

specimen.describe("Datasink — what the writer keeps", () => {
  specimen.it("defaults every target to the authored vocabulary", () => {
    for (const sink of datasink.sinks) specimen.expect(sink.target.keep).toEqual(writer.authored);
    specimen.expect(writer.split("a.%", "b/%.json").keep).toEqual(writer.authored);
  });

  specimen.it("lets a declaration overwrite it", () => {
    specimen.expect(writer.json("out.json", ["slug", "ontology"]).keep).toEqual(["slug", "ontology"]);
    specimen.expect(writer.split("a.%", "b/%.json", ["slug"]).keep).toEqual(["slug"]);
    const declared = new Datasink({ symbol: [["word", writer.json("out.json", ["slug"])]] });
    specimen.expect(declared.sinks[0].target.keep).toEqual(["slug"]);
  });

  specimen.it("prunes empty values, so an emitted row reads like an authored one", () => {
    const text = Datasink.canonical([
      { slug: "x", traits: [], trait: {}, ontology: "", symbol: {}, uses: [], in: [], symbols: [{ slug: "word" }] },
    ]);
    specimen.expect(Object.keys(JSON.parse(text)[0])).toEqual(["slug", "symbols"]);
  });
});

specimen.describe("Datasink — the codec table", () => {
  specimen.it("infers a codec from the extension and lets a constructor name one", () => {
    specimen.expect(writer.lift("out.json").codec).toBe("json");
    specimen.expect(writer.lift("out.jsonl").codec).toBe("jsonl");
    specimen.expect(writer.lift("out.js").codec).toBe("js");
    specimen.expect(writer.js("out.txt").codec).toBe("js");
  });

  specimen.it("refuses an extension no codec claims, instead of writing the wrong bytes", () => {
    specimen.expect(() => writer.lift("out.yaml")).toThrow(/no codec/);
    specimen.expect(() => Datasink.canonical([], "yaml")).toThrow(/unknown codec/);
  });

  specimen.it("emits each codec's own envelope over the same canonical rows", () => {
    const rows = [{ slug: "b" }, { slug: "a" }];
    specimen.expect(Datasink.canonical(rows, "json")).toBe('[\n  {\n    "slug": "a"\n  },\n  {\n    "slug": "b"\n  }\n]\n');
    specimen.expect(Datasink.canonical(rows, "jsonl")).toBe('{"slug":"a"}\n{"slug":"b"}\n');
    specimen.expect(Datasink.canonical(rows, "js").startsWith("export default [")).toBe(true);
    specimen.expect(Datasink.canonical(rows, "js").endsWith("];\n")).toBe(true);
  });

  specimen.it("stays open — a package may register its own", () => {
    writer.codec.tsv = (rows) => rows.map((row) => row.slug).join("\t") + "\n";
    specimen.expect(Datasink.canonical([{ slug: "b" }, { slug: "a" }], "tsv")).toBe("a\tb\n");
    delete writer.codec.tsv;
  });
});

specimen.describe("Datasink — the pure write algebra", () => {
  const target = writer.split("word.part-of-speech.%", "words/%.json");

  specimen.it("binds the capture into the target and writes a dual-capture row to BOTH", () => {
    const strata = Datasink.strata(words.map(project.row(["symbols"])), target);
    specimen.expect([...strata.keys()].sort())
      .toEqual(["words/adposition.json", "words/determiner.json", "words/noun.json", "words/verb.json"]);
    specimen.expect(strata.get("words/adposition.json").map((row) => row.slug)).toEqual(["del.contraction"]);
    specimen.expect(strata.get("words/determiner.json").map((row) => row.slug)).toEqual(["del.contraction"]);
  });

  specimen.it("gives a row that captures nothing no stratum at all — orphans, not a rest bucket", () => {
    const strata = Datasink.strata([{ slug: "bare", symbols: [{ slug: "word" }] }], target);
    specimen.expect([...strata.keys()]).toEqual([]);
  });

  specimen.it("knows no relation by name, so a package may split on any convention", () => {
    const strata = Datasink.strata(
      [{ slug: "x", literals: [{ slug: "curriculum.year.three" }] }],
      writer.split("curriculum.year.%", "years/%.json"),
    );
    specimen.expect([...strata.keys()]).toEqual(["years/three.json"]);
  });

  specimen.it("emits the same bytes regardless of the order the rows arrived in", () => {
    specimen.expect(Datasink.canonical(words)).toBe(Datasink.canonical([...words].reverse()));
  });
});
