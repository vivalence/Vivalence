import { Dataset, Datasink, project, writer } from "@vivalence/typology";

export const structural = [
  {
    slug: "proficiency.cefr.a1",
    traits: ["STRUCTURAL", "LABELED"],
    trait: { STRUCTURAL: {}, LABELED: { name: "CEFR > A1" } },
  },
  {
    slug: "proficiency.survival",
    traits: ["STRUCTURAL", "LABELED"],
    trait: { STRUCTURAL: {}, LABELED: { name: "Survival" } },
  },
];

export const ontological = [
  {
    slug: "word.suffix.are",
    traits: ["ONTOLOGICAL", "LABELED"],
    trait: { ONTOLOGICAL: {}, LABELED: { name: "-are" } },
  },
];

export const nouns = [
  {
    slug: "casa.noun",
    traits: ["TRANSLATED", "RANKED"],
    trait: { TRANSLATED: { known: "house", learning: "casa" }, RANKED: { rank: 2 } },
    symbols: [
      { slug: "word" },
      { slug: "word.part-of-speech.noun" },
      { slug: "word.lemma.casa" },
      { slug: "proficiency.cefr.a1" },
    ],
  },
  {
    slug: "del.contraction",
    traits: ["TRANSLATED", "RANKED"],
    trait: { TRANSLATED: { known: "of the", learning: "del" }, RANKED: { rank: 3 } },
    symbols: [
      { slug: "word" },
      { slug: "word.part-of-speech.adposition" },
      { slug: "word.part-of-speech.determiner" },
      { slug: "word.lemma.del" },
    ],
  },
];

export const verbs = [
  {
    slug: "parlare.verb",
    traits: ["TRANSLATED", "RANKED"],
    trait: { TRANSLATED: { known: "to speak", learning: "parlare" }, RANKED: { rank: 1 } },
    symbols: [
      { slug: "word" },
      { slug: "word.part-of-speech.verb" },
      { slug: "word.lemma.parlare" },
      { slug: "word.suffix.are" },
      { slug: "proficiency.survival" },
    ],
  },
];

export const sentences = [
  {
    slug: "la-casa-e-grande",
    traits: ["TRANSLATED"],
    trait: { TRANSLATED: { known: "The house is big", learning: "La casa è grande" } },
    symbols: [{ slug: "sentence" }, { slug: "word.lemma.casa" }],
  },
];

const dump = (rows) => `export default ${JSON.stringify(rows, null, 2)};\n`;

export async function corpus() {
  const dirname = await Deno.makeTempDir();
  const write = async (target, rows) => {
    await Deno.mkdir(`${dirname}/${target.split("/").slice(0, -1).join("/")}`, { recursive: true });
    await Deno.writeTextFile(`${dirname}/${target}`, dump(rows));
  };

  await write("dataset/symbols/structural.js", structural);
  await write("dataset/symbols/ontological.js", ontological);
  await write("dataset/literals/sentences.js", sentences);
  await write("dataset/literals/words/noun.js", nouns);
  await write("dataset/literals/words/verb.js", verbs);
  await Deno.writeTextFile(
    `${dirname}/dataset/literals/words/index.js`,
    `import noun from "./noun.js";\nimport verb from "./verb.js";\nexport default [...noun, ...verb];\n`,
  );

  return { dirname };
}

export const generation = (from, into, extension) => ({
  dataset: new Dataset({
    schema: {},
    symbol: [`${from}/symbols`],
    literal: [`${from}/literals`],
  }),
  datasink: new Datasink({
    symbol: [
      [{ slug: { $like: "word.lemma.%" } },
        project.refs("literals", [[true, project.slug]]),
        `${into}/symbols/lemmas.${extension}`],
      [{ traits: ["STRUCTURAL"] }, project.omit("literals"), `${into}/symbols/structural.${extension}`],
      [{ traits: ["ONTOLOGICAL"] }, project.omit("literals"), `${into}/symbols/ontological.${extension}`],
    ],
    literal: [
      ["sentence", `${into}/literals/sentences.${extension}`],
      ["word", writer.split("word.part-of-speech.%", `${into}/literals/words/%.${extension}`)],
    ],
  }),
});

export const dataset = () =>
  new Dataset({
    schema: {},
    symbol: ["dataset/symbols/structural.js", "dataset/symbols/ontological.js"],
    literal: ["dataset/literals/sentences.js", "dataset/literals/words"],
  });

export const datasink = () =>
  new Datasink({
    symbol: [
      [{ slug: { $like: "word.lemma.%" } },
        project.refs("literals", [[true, project.slug]]),
        "dataset/symbols/lemmas.json"],
      [{ traits: ["STRUCTURAL"] }, project.omit("literals"), "dataset/symbols/structural.json"],
      [{ traits: ["ONTOLOGICAL"] }, project.omit("literals"), "dataset/symbols/ontological.json"],
    ],
    literal: [
      ["sentence", "dataset/literals/sentences.json"],
      ["word", writer.split("word.part-of-speech.%", "dataset/literals/words/%.json")],
      [{ $and: [{ symbols: { $some: { slug: "word" } } },
                { symbols: { $none: { slug: { $like: "word.part-of-speech.%" } } } }] },
        "dataset/literals/words/rest.json"],
    ],
  });
