import { Type } from "@sinclair/typebox";

import { Trajectory, parsers } from "@vivalence/shared/trajectory";

const parser = parsers.sig;
export const createTrajectory = () => {
  const trajectory = new Trajectory([parser]);

  trajectory.use(async (input, ctx, next) => {
    ctx.runtime = {
      // ontology: {classify: {sentence: (text) => {return text .split(" ") .map((word) => ({ token: { text: word.toLowerCase() } }));},},},
      review: { annotation: (annotation, review) => {} },
    };
    return await next();
  });

  trajectory
    .branch(parser.pattern("/functions", "Home of all functions."))
    .open(
      parser.pattern({
        path: "/test",
        valence: `call this function to demo function calling capabilities.`,
        input: Type.Object({ text: Type.String() }),
      }),
      async (input, ctx) => {
        console.log("[TRAJECTORY CALLED] input", input);
        const output = input.text;
        return output;
      },
    );

  return trajectory;
};
