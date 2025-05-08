export default {
  slug: "adp",
  name: "Adposition",
  description:
    "An adposition is a word that combines with a noun or pronoun to form a phrase that typically has an adverbial function.",
  annotations: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
  ],
  relations: [{ unique: { branch: "pos" } }, { required: { branch: "pos", leaf: "adp" } }],
};
