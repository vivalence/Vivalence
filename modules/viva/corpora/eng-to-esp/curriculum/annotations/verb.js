export default () => {
  const lemmas = [
    "ser",
    "estar",
    "tener",
    "hacer",
    "poder",
    "decir",
    "ir",
    "ver",
    "dar",
    "saber",
    "querer",
    "llegar",
    "pasar",
    "deber",
    "poner",
    "parecer",
    "quedar",
    "creer",
    "hablar",
    "llevar",
  ];

  return [
    [
      ["lemma", lemmas],
      ["pos", ["verb"]],
      ["verbform", ["fin"]],
      ["mood", ["ind"]],
      ["tense", ["pres", "past", "fut", "imp"]],
      ["number", ["sing", "plur"]],
      ["person", ["1", "2", "3"]],
    ],
    [
      ["lemma", lemmas],
      ["pos", ["verb"]],
      ["verbform", ["inf", "ger", "part"]],
    ],
  ];
};
