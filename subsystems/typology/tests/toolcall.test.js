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
    const names = steer.trie.rollup(tools, () => null).map(({ steps }) => new ToolCall(steps).name);
    specimen.expect(names).toEqual(["fs_tree", "fs_find", "fs_read"]);
  });

  specimen.it("construction from a foreign Signature adopts identity, never linkage", () => {
    const tools = new Vector().open({ nature: "/fs/tree" }, () => {});
    const entries = steer.trie.rollup(tools, () => null);
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
});
