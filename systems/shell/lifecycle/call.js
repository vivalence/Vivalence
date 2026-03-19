import { controller, compiler, Signal } from "@vivalence/typology";
import { Prompt } from "@vivalence/sheets";

export default async function call(client) {
  client.call = async (signal, body = {}, params = {}) => {
    signal = new Signal();

    const [effect, apply] = controller.traverse(client.trajectory, signal);

    if (!effect) throw new errors.NotFound(signal);

    const context = {
      input: body,
      tools: client.tools,
      call: client.call,
    };

    await apply(context, async (ctx) => (ctx.effect = await effect(ctx)));

    return context.effect;

    // try {} catch (error) {if (error instanceof errors.NotFound) {console.log("[404] Signal not found:", signal); return { error: "Not Found", signal, status: 404 };} throw error;}
  };
}
