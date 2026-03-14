export default {
  slug: "propn",
  name: "Propper noun",
  description: "True names of people and places",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "propn" } },
  ],
};
