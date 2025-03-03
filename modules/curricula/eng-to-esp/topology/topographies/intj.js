export default {
  slug: "intj",
  name: "Interjection",
  description:
    "Interjections are words that express strong emotions or feelings. They are usually followed by an exclamation mark.",
  annotations: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
  ],
  relations: [{ unique: { branch: "pos" } }, { required: { branch: "pos", leaf: "intj" } }],
};
