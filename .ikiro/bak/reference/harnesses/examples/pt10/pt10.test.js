import { specimen } from "@vivalence/typology";
import { answered, assemble, scripted, userTurn } from "../rig.js";
import { harness } from "./harness.js";
import { tools } from "./tools.js";

const world = () => {
  const rows = [{ id: "b1", index: 0, thread: "t1", mode: "m1", data: { step: 0 } }];
  const flushed = [];
  const daemon = {
    entities: {
      buffer: { findOne: async (where) => rows.find((row) => row.thread === where.thread && row.mode === where.mode) ?? null },
      em: { flush: async () => flushed.push(rows.map((row) => ({ ...row.data }))) },
    },
  };
  return { rows, flushed, daemon };
};

const call = (id, name, input) => ({
  role: "assistant",
  parts: [{ type: "tool_use", id, name, input }],
  meta: { state: "tools" },
});
const say = (text) => ({ role: "assistant", parts: [{ type: "text", text }], meta: { state: "complete" } });

specimen.describe("pt10 rebuilt — index in context, pages behind a tool, screen last", () => {
  specimen.it("reads before it instructs, moves the screen, then answers", async () => {
    const { rows, flushed, daemon } = world();
    const { cortex, seen } = scripted((request) => {
      const results = answered(request.turns).length;
      if (results === 0) return call("t1", "guide_read", { step: 2 });
      if (results === 1) return call("t2", "guide_step", { step: 2 });
      return say("**Motor bolts longer than 6 mm touch the windings.** Seat the motor, then thread the wires.");
    });
    daemon.cortex = cortex;
    const mentor = assemble({ daemon, mode: { id: "m1" }, thread: { id: "t1" }, harness, tools });

    const folded = await mentor.dialogue.render({ turns: [userTurn("how do I mount the motors?")] });
    console.log("REQUEST[0]", JSON.stringify(seen[0], null, 1));
    console.log("TOOL_RESULTS", JSON.stringify(answered(seen[2].turns), null, 1));
    console.log("FOLDED", JSON.stringify({ meta: folded.meta, output: folded.output }, null, 1));

    specimen.expect(Object.keys(seen[0].system)).toEqual(["role", "guide", "format", "screen"]);
    specimen.expect(seen[0].system.screen).toBe("On the operator's screen: step 0 · Overview · Everything in the kit.");
    specimen.expect(seen[0].tools).toEqual(["guide_read", "guide_step"]);
    specimen.expect(folded.meta.state).toBe("complete");
    specimen.expect(rows[0].data.step).toBe(2);
    specimen.expect(flushed).toHaveLength(1);
  });

  specimen.it("an out-of-range step comes back as an error the model can read, and the loop continues", async () => {
    const { daemon } = world();
    const { cortex, seen } = scripted((request) =>
      answered(request.turns).length ? say("There are only steps 0 to 3.") : call("t1", "guide_read", { step: 9 }));
    daemon.cortex = cortex;
    const mentor = assemble({ daemon, mode: { id: "m1" }, thread: { id: "t1" }, harness, tools });
    const folded = await mentor.dialogue.render({ turns: [userTurn("read step 9")] });
    const [result] = answered(seen[1].turns);
    console.log("ERROR_RESULT", JSON.stringify(result, null, 1));
    specimen.expect(folded.meta.state).toBe("complete");
    specimen.expect(JSON.stringify(result.output)).toContain("error");
  });

  specimen.it("no buffer on the thread: the tool refuses with the fix in the message", async () => {
    const { daemon } = world();
    const { cortex, seen } = scripted((request) =>
      answered(request.turns).length ? say("Open the guide first.") : call("t1", "guide_step", { step: 1 }));
    daemon.cortex = cortex;
    const mentor = assemble({ daemon, mode: { id: "m1" }, thread: { id: "t9" }, harness, tools });
    await mentor.dialogue.render({ turns: [userTurn("show step 1")] });
    const [result] = answered(seen[1].turns);
    specimen.expect(JSON.stringify(result.output)).toContain("ask the operator to open the guide first");
    specimen.expect(seen[0].system.screen).toBe("Nothing is on the operator's screen.");
  });

  specimen.it("an object render never sees the dialogue-only sections", async () => {
    const { daemon } = world();
    const { cortex, seen } = scripted((request) => ({
      role: "assistant", parts: [{ type: "object", data: { ok: true } }], meta: { state: "complete" }, object: { ok: true },
    }));
    daemon.cortex = cortex;
    const mentor = assemble({ daemon, mode: { id: "m1" }, thread: { id: "t1" }, harness, tools });
    await mentor.object.render({ turns: [userTurn("classify")], output: { type: "object" } });
    specimen.expect(Object.keys(seen[0].system)).toEqual(["role", "guide"]);
  });
});
