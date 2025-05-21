export default async function provision(input, ctx) {
  const learnables = [
    {
      slug: "puer",
      known: "the boy",
      learning: "puer",
    },
    {
      slug: "puella",
      known: "the girl",
      learning: "puella",
    },
    {
      slug: "canare",
      known: "to sing",
      learning: "canare",
    },
    {
      slug: "canit",
      known: "[third person] sings",
      learning: "canit",
    },
  ];

  const process = [
    {
      slug: "1_introduction_boy_runs",
      step: "build the sentence 'the boy runs' from described building blocks",
    },
    {
      slug: "2_introduction_girl_signs",
      step: "build the sentence 'the girl sings' from described building blocks",
    },
    {
      slug: "3_combination_girl_signs",
      step: "build the sentence 'the girl runs' by their own volition",
    },
    {
      slug: "4_combination_boy_runs",
      step: "build the sentence 'the boy sings by their own volition",
    },
  ];
  return [{ process, learnables }];
}
