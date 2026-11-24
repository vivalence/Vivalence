import { fixture } from "./fixture.js";
const f = await fixture();
for (const [k, m] of Object.entries({ harvest: f.harvest, nyan: f.nyan, harness: f.runtimeHarness })) console.log(k, "primer:", Boolean(m.primer), "tools:", Boolean(m.tools), "keys:", Object.keys(m).join(","));
