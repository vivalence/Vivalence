export default () => {
  const lemmas = [
    "cuando",
    "pues",
    "mientras",
    "aunque",
    "porque",
    "si",
    "que",
    "como",
  ];

  return [
    [
      ["pos", ["sconj"]],
      ["lemma", lemmas],
    ],
  ];
};
