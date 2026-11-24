import { Controller, Cortex, Span } from "@vivalence/typology";
try {
  const events = await new Cortex().hallucinate.verbatim.stream({ controller: new Controller({ stdout: new Span("p") }), source: (async function* () {})() });
  for await (const _ of events);
  console.log("resolved");
} catch (error) { console.log(error.message); }
