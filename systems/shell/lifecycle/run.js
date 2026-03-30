import { steer, Signal } from "@vivalence/typology"
import { Prompt } from "@vivalence/sheets"

export default async function run(client) {
  const signal = new Signal(Deno.args.join("/"))

  const [effect, apply, steps] = await steer.walk(
    client.trajectory,
    signal,
    async (patterns) => {
      const options = patterns.map((p) => ({ value: p.signature }))
      const selection = await Prompt.Select.prompt({ message: "navigate", options })
      return new Signal(selection)
    },
  )

  const context = {
    output: client.output,
    call: client.call,
  }

  await apply(context, async (ctx) => {
    const result = await effect(ctx)
    if (result !== undefined) client.output.print(result)
  })

  return client
}
