import { specimen } from "@vivalence/typology";
import { assemble, scripted, userTurn } from "../rig.js";
import { ANSWER, harness } from "./harness.js";

const object = (data) => ({ role: "assistant", parts: [{ type: "object", data }], meta: { state: "complete" }, object: data });
const LEGAL = ["e2e4", "d2d4", "g1f3"];
const brief = userTurn("Position: start. Legal: e2e4 d2d4 g1f3. Your move.");

specimen.describe("seat — the harness verifies in code and repairs with the fault as prompt", () => {
  specimen.it("an illegal answer is repaired once; the caller only ever sees a legal move", async () => {
    const answers = [{ uci: "e2e5", comment: "Bold." }, { uci: "e2e4", comment: "King's pawn." }];
    const { cortex, seen } = scripted((_, index) => object(answers[index]));
    const seat = assemble({ daemon: { cortex }, mode: { id: "m1" }, harness });

    const folded = await seat.object.render({ turns: [brief], output: ANSWER, legal: LEGAL });
    console.log("REQUEST[0]", JSON.stringify({ system: seen[0].system, turns: seen[0].turns, cache: seen[0].cache, settings: seen[0].settings, output: Object.keys(seen[0].output ?? {}) }, null, 1));
    console.log("REQUEST[1].turns", JSON.stringify(seen[1].turns, null, 1));
    console.log("FOLDED.output", JSON.stringify(folded.output, null, 1));

    specimen.expect(seen).toHaveLength(2);
    specimen.expect(folded.output.object.uci).toBe("e2e4");
    specimen.expect(seen[1].turns).toHaveLength(1);
    specimen.expect(seen[1].turns[0].parts.at(-1).text).toContain("Rejected, not legal in this position: e2e5");
  });

  specimen.it("a legal first answer costs exactly one call", async () => {
    const { cortex, seen } = scripted(() => object({ uci: "g1f3", comment: "Develop." }));
    const seat = assemble({ daemon: { cortex }, mode: { id: "m1" }, harness });
    await seat.object.render({ turns: [brief], output: ANSWER, legal: LEGAL });
    specimen.expect(seen).toHaveLength(1);
  });

  specimen.it("three illegal answers throw, naming every one", async () => {
    const { cortex, seen } = scripted(() => object({ uci: "a1a8", comment: "?" }));
    const seat = assemble({ daemon: { cortex }, mode: { id: "m1" }, harness });
    let error = null;
    await seat.object.render({ turns: [brief], output: ANSWER, legal: LEGAL }).catch((thrown) => (error = thrown));
    specimen.expect(seen).toHaveLength(3);
    specimen.expect(error.message).toBe("[seat] no legal move after 3 answers: a1a8, a1a8, a1a8");
  });

  specimen.it("the dialogue avenue is untouched by the object verifier", async () => {
    const { cortex, seen } = scripted(() => ({ role: "assistant", parts: [{ type: "text", text: "hi" }], meta: { state: "complete" } }));
    const seat = assemble({ daemon: { cortex }, mode: { id: "m1" }, harness });
    const folded = await seat.dialogue.render({ turns: [userTurn("hello")], legal: LEGAL });
    specimen.expect(seen).toHaveLength(1);
    specimen.expect(folded.output.message).toBe("hi");
  });
});
