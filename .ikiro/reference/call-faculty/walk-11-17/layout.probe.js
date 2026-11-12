import { v } from "@vivalence/typology";
const ROOT = "/Users/finn/vivalence/code/vivalence/";
const { Packet, Turn } = v.primitives.hallucination;
for (const path of ["commons/hallucinators/anthropic/tests/snapshots/translate-stream-events.snapshot.json", "commons/hallucinators/openrouter/tests/snapshots/translate-stream-events.snapshot.json", "subsystems/typology/tests/snapshots/hallucination-stream.snapshot.json"]) {
  console.log("---", path.split("/").slice(-4, -3)[0], path.split("/").at(-1));
  for (const packet of JSON.parse(await Deno.readTextFile(ROOT + path))) {
    if (packet === null) { console.log("null · no packet"); continue; }
    const faults = [...Packet.Response.faults(packet)];
    if (faults.length) console.log(JSON.stringify(packet), "· INVALID");
  }
}
for (const path of ["commons/hallucinators/anthropic/tests/snapshots/translate-response.snapshot.json", "commons/hallucinators/openrouter/tests/snapshots/translate-response.snapshot.json"])
  console.log("--- turn", path.split("/")[2], [...Turn.errors(JSON.parse(await Deno.readTextFile(ROOT + path)))].length ? "INVALID" : "valid");
