import { controller, errors, Signal } from "@vivalence/typology";
import { Prompt } from "@vivalence/sheets";

export default async function run(client) {
  let signal = new Signal(Deno.args.join("/"));
  // console.log("Signal@shell", signal);

  const [effect, apply, steps, destination] = //
    await controller.walk(client.trajectory, signal, async (patterns) => {
      const message = "";
      const options = [];

      patterns.map((p) => options.push({ value: p.signature }));
      // console.log("@shell/run options", options);
      const selection = await Prompt.Select.prompt({ message, options });
      return new Signal(selection);
    });

  const context = {
    tools: client.tools,
    call: client.call,
  };

  // console.log("APPLYING TRAJECTORY");
  await apply(context, async (ctx) => (ctx.effect = await effect(ctx)));
  console.log("APPLIED EFFECT");
  // console.log({ context });
  // if (typeof effect === instanceof process) {observe}

  return client;
}
