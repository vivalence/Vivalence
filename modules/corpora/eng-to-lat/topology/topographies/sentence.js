export default {
  slug: "sentence",
  name: "Sentence",
  description: "Sentences are sentences",
  dimensions: [
    { branch: ["pos"], required: true },
    // { branch: ["lemma"], required: true },
    // { branch: ["numtype"], required: true },
    // { branch: ["gender"] },
    // { branch: ["number"] },
    // { branch: ["numform"] },
  ],
  relations: [
    { unique: { branch: "pos" } },
    // { required: { branch: "pos", leaf: "num" } },
    // { unique: { branch: "gender" } },
    // { unique: { branch: "number" } },
    // { unique: { branch: "numtype" } },
    // { unique: { branch: "numform" } },
  ],
};
