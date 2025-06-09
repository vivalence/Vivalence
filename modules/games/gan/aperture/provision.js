import { Scope } from "@vivalence/shared";
import LearnablesAgent from "./agents/learnables.js";
import SessionAgent from "./agents/session.js";

// input {scope,text}
export default async function provisionByText(input, ctx) {
  const scope = new Scope({ units: [], ...input.scope });
  scope.game = { slug: ctx.game.manifest.slug };

  const learnables = await LearnablesAgent({ text: input.text }, ctx);

  const promises = [];
  for (const learnable of learnables) {
    promises.push(
      (async () => {
        const features = await ctx.runtime.classify.text(learnable.learning);

        for (const feature of features) {
          if (feature.unit) scope.units.push({ id: feature.unit.id });
          // const unit = await ctx.runtime.entities.unit.findOne({ annotation: feature.annotation }, { fields: ["id"] });
        }
      })(),
    );
  }

  const session = await SessionAgent({ learnables, text: input.text }, ctx);
  await Promise.all(promises);

  const instruction = {
    instruction: { session, learnables },
    scope,
    bundle: {
      type: "game",
      url: ctx.game.bundle.url.href,
      game: { slug: ctx.game.manifest.slug },
    },
  };

  console.log("@eva/provision [INSTRUCTION]", JSON.stringify(instruction));

  return [instruction];
}
