// const mockBrain = {
//   generate: {
//     object: async ({ schema, system, prompt }) => {
//       return {
//         nextStep: {
//           index: 2,
//           slug: "introduction_girl_signs",
//           task: "build the sentence 'the girl sings' from described building blocks"
//         },
//         userPrompt: "Great job! Now let's try building 'the girl sings'. Use the words: puella (the girl) and canit (sings)",
//         shouldAdvance: true,
//         reasoning: "User successfully built the first sentence, ready for next challenge"
//       };
//     }
//   }
// };
const demo_1 = `
lets start with this sentence: "The girl sings."
latin for girl is puella.
to sing is canere, but thats the infinite version of the verb.
For third person singular, add "-it" to the stem "can-".
whats "the girl sings" in latin?
`;

const learnables = [
  {
    state: "todo",
    slug: "puer",
    known: "the boy",
    learning: "puer",
  },
  {
    state: "todo",
    slug: "puella",
    known: "the girl",
    learning: "puella",
  },
  {
    state: "todo",
    slug: "canare",
    known: "to sing",
    learning: "canare",
  },
  {
    state: "todo",
    slug: "currere",
    known: "to run",
    learning: "currere",
  },
];

const process = [
  {
    index: 1,
    slug: "introduction_boy_runs",
    task: "build the sentence 'the boy runs' from described building blocks",
  },
  {
    index: 2,
    slug: "introduction_girl_signs",
    task: "build the sentence 'the girl sings' from described building blocks",
  },
  {
    index: 3,
    slug: "combination_girl_runs",
    task: "build the sentence 'the girl runs' by their own volition",
  },
];
