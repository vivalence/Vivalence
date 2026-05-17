import { steer, Signal } from "@vivalence/typology"
import { Prompt } from "@vivalence/sheets"

export default async function run(trajectory, ctx) {
  const [effect, apply] = await steer.walk(trajectory, async (patterns) => {
    const options = patterns.map((p) => ({ value: p.signature }))
    const selection = await Prompt.Select.prompt({ message: "navigate", options })
    return new Signal(selection)
  })

  let result
  await apply(ctx, async (c) => {
    result = await effect(c)
  })
  return result
}
