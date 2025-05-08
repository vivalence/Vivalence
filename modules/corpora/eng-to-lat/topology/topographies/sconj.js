export default {
  slug: "sconj",
  name: "Subordinating Conjunction",
  description:
    "A subordinating conjunction is a conjunction that introduces a dependent clause, joining it to a main clause. It is also known as a subordinator or subordinate conjunction.",
  annotations: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
  ],
  relations: [{ unique: { branch: "pos" } }, { required: { branch: "pos", leaf: "sconj" } }],
};
