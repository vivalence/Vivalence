export default {
  slug: "punct",
  name: "Punctuation",
  description: "Punctuation marks",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "punct" } },
  ],
};
