import paladin from "@vivalence/paladin"
import { Vector, Signal } from "@vivalence/typology"

import boot from "./lifecycle/boot.js"
import parse from "./lifecycle/parse.js"
import trajectory from "./trajectories/index.js"
import call from "./lifecycle/call.js"
import run from "./lifecycle/run.js"
import { create as createOutput } from "./lib/output.js"

await paladin.ikiro

const { flags, signal, body, argv } = parse(Deno.args)

const isAgent = !Deno.stdin.isTerminal() || flags.json

export const client = {
  process: null,
  trajectory: new Vector(),
  signal: new Signal(signal),
  body,
  argv,
  flags,
  output: createOutput(isAgent),
  isAgent,
}

await boot(client)
await trajectory(client)
await call(client)

if (isAgent || signal) {
  try {
    const result = await client.call(signal, body)
    if (result !== undefined) client.output.print(result)
  } catch (error) {
    client.output.error(error.message)
    Deno.exit(1)
  }
} else {
  try {
    let i = 0
    while (i++ < 25) await run(client)
  } catch (error) {
    client.output.error(error.message)
  }
}
