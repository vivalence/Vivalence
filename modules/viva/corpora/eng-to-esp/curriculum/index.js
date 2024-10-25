import annotations from "./annotations.js";

export default (runtime) => {
  const schema = runtime.schema;
  const { units, lemmas } = annotations().reduce(
    (acc, annotation) => {
      acc.units.push({ annotation });
      if (["verb"].includes(annotation.pos)) acc.lemmas.add(annotation.lemma);
      return acc;
    },
    { units: [], lemmas: new Set() },
  );

  const tags = Array.from(lemmas).map((lemma) => ({ ontology: { branch: "lemma", leaf: lemma } }));
  // console.log(tags, units);

  return {};
};
