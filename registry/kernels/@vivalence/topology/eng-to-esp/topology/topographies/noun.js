export default {
  slug: "noun",
  name: "Noun",
  description: "A noun is a word that represents a person, place, or thing.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["gender"], required: true },
    { branch: ["number"], required: true },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "noun" } },
    { unique: { branch: "gender" } },
    {
      some: [
        { required: { branch: "gender", leaf: "masc" } },
        { required: { branch: "gender", leaf: "fem" } },
      ],
    },
    { required: { branch: "number" } },
    // { required: { branch: "number", leaf: "plur" } },
  ],
};
