export default () => {
  return [
    [
      ["pos", ["det"]],
      ["prontype", ["art"]],
      ["definite", ["def", "ind"]],
      ["number", ["sing"]],
      ["gender", ["masc"]],
    ],
    [
      ["lemma", ["este", "ese", "aquel"]],
      ["pos", ["det"]],
      ["prontype", ["dem"]],
      ["number", ["sing"]],
      ["gender", ["masc"]],
    ],
    [
      ["number", ["sing", "plur"]],
      ["person", ["1", "2", "3"]],
      ["pos", ["det"]],
      ["prontype", ["prs"]],
      ["poss", ["yes"]],
    ],
  ];
};
