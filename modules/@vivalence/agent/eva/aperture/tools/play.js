import { sleep } from "@vivalence/shared";
import { Type } from "@sinclair/typebox";

export default (trajectory, ctx) => {
  const games = trajectory.branch((p) =>
    p.sig({
      path: "/play/game",
      valence: `# Play Game:
	Contains all the games available to the learner.
	Each game takes a specific and unique type of input, take great care to properly set that up.
	`,
    }),
  );

  const gan = ctx.runtime.modules.games.gan;

  games.open(
    {
      path: "/gan",
      valence: `# GAN: ${gan.manifest.description}
	${gan.manifest.valence}
	Method will return Process state. `,
      input: Type.Object({
        text: Type.String({
          description: `
	    Some instruction about the concepts, terms, vocabulary, or sentences to cover.
	    Pass all context the user provided regarding the expected task.
	    Examples: ["Practice past tense verbs with regular and irregular forms.", "Conjugate present tense verbs for all persons.", "Use array methods like map, filter, and reduce.", "Solve linear equations with variables on both sides.", "Practice der, die, das articles with nouns.", "Conjugate avoir and être in passé composé.", "Understand ownership rules with borrowing examples.", "Handle asynchronous operations with async/await.", "Factor quadratic expressions using common techniques.", "Practice ser versus estar usage in context."]
	`,
        }),
      }),
    },
    async (input, context) => {
      input.game = { slug: gan.manifest.slug };
      const promise = ctx.runtime.call("/provision/game", input);
      context.instructions.push(promise);
      return "Game Found.";
    },
  );

  return trajectory;
};
