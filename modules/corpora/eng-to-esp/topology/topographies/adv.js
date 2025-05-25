export default {
  slug: "adv",
  name: "Adverb",
  description:
    "An adverb is a word that modifies a verb, adjective, determiner, clause, preposition, or sentence. Adverbs typically express manner, place, time, frequency, degree, level of certainty, etc., answering questions such as how?, in what way?, when?, where?, and to what extent?.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["degree"] },
    { branch: ["prontype"] },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "adv" } },
    { unique: { branch: "degree" } },
    { unique: { branch: "prontype" } },
  ],
};
