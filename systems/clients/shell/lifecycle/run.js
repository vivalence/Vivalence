import { signature, controller, classes, errors } from "@vivalence/vector";
import { Prompt } from "@vivalence/surface-shell";

export default async function run(client) {
  const signal = signature.signal(Deno.args.join("/"));
  // console.log("run signal", Deno.args, signal);

  const getSignal = async (patterns) => {
    if (signal.length > 0) return signal.splice(0, signal.length);
    if (!patterns || patterns.length === 0) return [];

    const selection = await Prompt.Select.prompt({
      message: "",
      options: patterns.map((p) => ({ value: p.signature })),
    });

    return signature.signal(selection);
  };

  const [effect, apply, destination, steps] = //
    await controller.walk(client.trajectory, getSignal);

  const context = new classes.Context({
    tools: client.tools,
    call: client.call,
  });

  // console.log("APPLYING TRAJECTORY");
  await apply(context, async (ctx) => (ctx.effect = await effect(ctx)));
  console.log("APPLIED EFFECT");
  // console.log({ context });
  // if (typeof effect === instanceof process) {observe}

  return client;
}
