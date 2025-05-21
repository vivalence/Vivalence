export class MockAI {
  functionCalls = [];

  wrapCallables(callables) {
    return callables.map((callable) => ({
      ...callable,
      func: async (input) => {
        this.functionCalls.push({
          name: callable.name,
          input,
        });
        return await callable.func(input);
      },
    }));
  }
}

//   async complete(prompt) {
//     if (prompt.includes("Learning Architect")) {
//       return {
//         completion: `# Latin Learning Itinerary for Beginners

// ## Learning Objectives
// - Understand basic Latin noun gender (masculine/feminine)
// - Learn first vocabulary: puer (boy), puella (girl)
// - Learn first verb: currit (runs)
// - Construct simple sentences

// ## Introduction Sequence
// 1. Introduce nouns: "puella" (girl) and "puer" (boy)
// 2. Explain gender: feminine and masculine
// 3. Introduce verb: "currit" (runs)
// 4. Demonstrate sentence construction

// ## Practice Exercises
// 1. Translate: "puella currit" (the girl runs)
// 2. Translate: "puer currit" (the boy runs)
// 3. Identify gender: Is "puella" masculine or feminine?

// ## Review
// - Review vocabulary: puella, puer, currit
// - Review gender concepts
// - Practice sentence formation

// ## Assessment
// - Correct translation of simple sentences
// - Identification of noun gender
// - Understanding of subject-verb relationships`,
//       };
//     } else if (prompt.includes("Skill Shepherd")) {
//       return {
//         completion: `Let's learn some basic Latin!

// Today we'll start with two important nouns:

// "puella" - which means "girl" in Latin
// "puer" - which means "boy" in Latin

// These words have different genders in Latin:
// - "puella" is feminine
// - "puer" is masculine

// Now let's add an action. The Latin word "currit" means "runs" or "is running".

// Let's put these together to make our first sentences:

// "puella currit" - "the girl runs"
// "puer currit" - "the boy runs"

// Can you translate "puer currit" into English?`,
//       };
//     } else if (prompt.includes("Knowledge Arbiter")) {
//       return {
//         completion: `I've analyzed your response to the translation task.

// You translated "puella currit" as "the girl runs."

// Let me check this:
// 1. "puella" means "girl" in Latin (feminine noun)
// 2. "currit" means "runs" (third-person singular present tense verb)

// Your translation is correct! You've accurately identified:
// - The meaning of each word
// - The subject-verb relationship
// - The present tense of the action

// Great job understanding your first Latin sentence!`,
//       };
//     }
//     return { completion: "Test response" };
//   }
