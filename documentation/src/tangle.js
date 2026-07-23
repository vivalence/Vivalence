import { specimen } from "@vivalence/typology"
import { readdirSync } from "node:fs"
import { dirname, join } from "node:path"

const DOCS = new URL("../content/", import.meta.url).pathname

function walk(directory) {
  const examples = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) examples.push(...walk(full))
    else if (entry.name.endsWith(".example.js")) examples.push(full)
  }
  return examples
}

for (const file of walk(DOCS)) {
  const example = await import(`file://${file}`)
  const logs = []
  const original = console.log
  console.log = (...args) => logs.push(args.map((value) => (typeof value === "string" ? value : JSON.stringify(value))).join(" "))
  let records = null
  let error = null
  try {
    const returned = await example.run()
    if (Array.isArray(returned)) records = returned
  } catch (caught) {
    error = caught.message
  }
  console.log = original
  const channel = records ? "span" : "stdout"
  const payload = { name: example.name, channel, logs, records, error }
  const { path } = specimen.snapshot(payload, { base: dirname(file), dry: false, parse: (value) => value, locate: `${example.name}.snapshot.json` })
  console.log(`snapshot → ${path} · ${channel}`)
}
