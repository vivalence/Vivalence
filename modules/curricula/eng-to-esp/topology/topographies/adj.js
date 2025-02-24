export default {
  slug: "adj",
  name: "Adjective",
  description:
    "An adjective is a word that describes a noun or pronoun. It tells us what the thing being described is like by giving us more information about the object. Adjectives can be used to describe physical appearance, personality, color, size, shape, age, and more.",
  annotations: [
    { branch: ["pos"], required: true }, // { default?: "adj" },
    { branch: ["lemma"], required: true },
    { branch: ["gender"], required: true },
    { branch: ["number"], required: true },
    { branch: ["degree"] },
  ],
};
