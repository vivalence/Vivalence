import { specimen, steer, ToolCall, Signal, Vector } from "@vivalence/typology";

specimen.describe("ToolCall — the wire↔signal codec, a Signal sibling on the underscore", () => {
  specimen.it("a flat name is one segment", () => {
    const call = new ToolCall("lookup");
    specimen.expect(call.name).toBe("lookup");
    specimen.expect(call.signal.pathname).toBe("/lookup");
  });

  specimen.it("an underscore name decodes into nested segments", () => {
    const call = new ToolCall("drill_pick");
    specimen.expect(call.absolute).toEqual(["drill", "pick"]);
    specimen.expect(call.name).toBe("drill_pick");
    specimen.expect(call.signal.pathname).toBe("/drill/pick");
  });

  specimen.it("name and signal round-trip: the join is the inverse of the split", () => {
    const call = new ToolCall("aprende_flashcard");
    specimen.expect(call.signal.pathname).toBe("/aprende/flashcard");
    specimen.expect(new ToolCall(call.name).signal.pathname).toBe(call.signal.pathname);
  });

  specimen.it("builds from trie steps and joins to the wire name", () => {
    const steps = [{ nature: "clinic" }, { nature: "conjugate" }];
    specimen.expect(new ToolCall(steps).name).toBe("clinic_conjugate");
  });

  specimen.it("its signal is a real Signal, ready for steer.dispatch", () => {
    specimen.expect(new ToolCall("drill_pick").signal).toBeInstanceOf(Signal);
  });

  specimen.it("builds from live trie Patterns: siblings keep distinct names", () => {
    const tools = new Vector()
      .open({ nature: "/fs/tree" }, () => {})
      .open({ nature: "/fs/find" }, () => {})
      .open({ nature: "/fs/read" }, () => {});
    const names = steer.trie.leaves(tools).map(({ steps }) => new ToolCall(steps).name);
    specimen.expect(names).toEqual(["fs_tree", "fs_find", "fs_read"]);
  });

  specimen.it("construction from a foreign Signature adopts identity, never linkage", () => {
    const tools = new Vector().open({ nature: "/fs/tree" }, () => {});
    const entries = steer.trie.leaves(tools);
    const donor = entries[0].steps[0];
    const gauges = donor.gauges.length;
    const trace = donor.trace;
    new ToolCall(entries[0].steps).name;
    new ToolCall(entries[0].steps).name;
    specimen.expect(donor.gauges.length).toBe(gauges);
    specimen.expect(donor.trace).toBe(trace);
  });

  specimen.it("an array argument is read, not consumed", () => {
    const steps = [{ nature: "fs" }, { nature: "tree" }];
    new ToolCall(steps);
    specimen.expect(steps.length).toBe(2);
  });

  specimen.it("Q39A (R8) — a tool step carrying _ is refused, loud; every other leaf round-trips", () => {
    const armed = new Vector();
    armed.branch("/teacher/word_list").open({ nature: "/deal" }, () => ({}));
    armed.branch("/teacher/francesca").open({ nature: "/drill" }, () => ({}));
    const verdicts = steer.trie.leaves(armed).map(({ steps }) => {
      try {
        const name = new ToolCall(steps).name;
        return { name, back: new ToolCall(name).signal.pathname };
      } catch (error) {
        return { refused: error.message };
      }
    });
    console.log(JSON.stringify(verdicts, null, 2));
    specimen.expect(verdicts).toEqual([
      { refused: '[toolcall] a tool step carries "_", it would not split back: word_list' },
      { name: "teacher_francesca_drill", back: "/teacher/francesca/drill" },
    ]);
  });

  specimen.it("Q28 (R4) — a name past 64 chars is refused, loud, never cut; 64 passes", () => {
    const at = (length) => new ToolCall([{ nature: "daemon" }, { nature: "x".repeat(length - "daemon_".length) }]);
    specimen.expect(at(64).name).toHaveLength(64);
    specimen.expect(() => at(65).name).toThrow("65 chars, a provider caps a tool name at 64");
  });
});
