import { steer, Signal, errors } from "@vivalence/typology"

export default function call(client) {
  client.call = async (signal, body = {}) => {
    signal = new Signal(signal)

    const [effect, apply] = steer.traverse(client.trajectory, signal)

    if (!effect) throw new errors.NotFound(signal)

    const context = {
      input: body,
      argv: client.argv,
      flags: client.flags,
      output: client.output,
      call: client.call,
    }

    await apply(context, async (ctx) => (ctx.result = await effect(ctx)))

    return context.result
  }
}
