import { suite } from "./47.03-stripwire.suite.js"

for (const [name, run] of Object.entries(suite.tests)) Deno.test(name, run)
