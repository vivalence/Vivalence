export default () => {
  return [
    [
      ["pos", ["pron"]],
      ["prontype", ["prs"]],
      ["number", ["sing", "plur"]],
      ["person", ["1", "2", "3"]],
      ["gender", ["masc"]],
    ],
    [
      ["pos", ["pron"]],
      ["prontype", ["prs"]],
      ["prepcase", ["pre", "npr"]],
      ["number", ["sing", "plur"]],
      ["person", ["1", "2", "3"]],
      ["gender", ["masc"]],
    ],
    [
      ["pos", ["pron"]],
      ["prontype", ["prs"]],
      ["reflex", ["yes"]],
      ["number", ["sing", "plur"]],
      ["person", ["1", "2", "3"]],
      ["gender", ["masc"]],
    ],
    [
      ["lemma", ["que", "quien", "cual"]],
      ["pos", ["pron"]],
      ["prontype", ["rel"]],
      ["number", ["sing"]],
      ["gender", ["masc"]],
    ],
    [
      ["lemma", ["qué", "quién", "cuál"]],
      ["pos", ["pron"]],
      ["prontype", ["int"]],
      ["number", ["sing"]],
      ["gender", ["masc"]],
    ],
    [
      ["lemma", ["este", "ese", "aquel"]],
      ["pos", ["pron"]],
      ["prontype", ["dem"]],
      ["number", ["sing"]],
      ["gender", ["masc"]],
    ],
    [
      ["lemma", ["alguno", "ninguno", "alguien", "nadie"]],
      ["pos", ["pron"]],
      ["prontype", ["ind"]],
      ["number", ["sing"]],
      ["gender", ["masc"]],
    ],
    [
      ["lemma", ["qué"]],
      ["pos", ["pron"]],
      ["prontype", ["exc"]],
    ],
  ];
};
