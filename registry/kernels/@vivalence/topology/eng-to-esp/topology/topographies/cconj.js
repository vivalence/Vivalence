export default {
  slug: "cconj",
  name: "Cconj",
  description: "A cconj is a word that represents a specific part of speech.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "cconj" } },
  ],
};
