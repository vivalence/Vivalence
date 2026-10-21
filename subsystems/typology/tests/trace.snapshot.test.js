import { specimen, trace } from "@vivalence/typology";

const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

specimen.describe("trace snapshot: a hand-authored story, chronicled to disk", () => {
  specimen.it("explicit records fold into the committed tree", () => {
    const records = [
      { at: 0, path: ["render"], track: "start" },
      { at: 1, path: ["render", "provider"], track: "start" },
      { at: 2, path: ["render", "provider"], track: "log", data: { model: "opus" } },
      { at: 6, path: ["render", "provider"], track: "stop" },
      { at: 7, path: ["render", "tool"], track: "fault", data: { type: "Error", message: "boom" } },
      { at: 9, path: ["render"], track: "stop" },
    ];
    const capture = specimen.snapshot(trace.chronicle(records).roots, {
      base,
      dry: DRY,
      locate: "trace.snapshot.json",
      parse: (roots) => roots,
    });
    console.log(`\n===BEGIN trace → ${capture.path}===\n${JSON.stringify(capture.pojo, null, 2)}\n===END===\n`);
    specimen.expect(capture.pojo[0].timing).toEqual({ begun: 0, sealed: 9 });
    specimen.expect(capture.pojo[0].children[0].entries[0].data.model).toBe("opus");
    specimen.expect(capture.pojo[0].children[1].fault).toEqual({ at: 7, type: "Error", message: "boom" });
  });
});
