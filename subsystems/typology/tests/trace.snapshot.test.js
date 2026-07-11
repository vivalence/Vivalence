import { specimen, trace } from "@vivalence/typology";

const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

specimen.describe("trace snapshot: a hand-authored story, chronicled to disk", () => {
  specimen.it("explicit records fold into the committed tree", () => {
    const records = [
      { span: "render", trace: null, path: "/render", verb: "open", at: 0 },
      { span: "provider", trace: "render", path: "/render/provider", verb: "open", at: 1 },
      { span: "provider", trace: "render", path: "/render/provider", verb: "note", at: 2, data: { model: "opus" } },
      { span: "provider", trace: "render", path: "/render/provider", verb: "close", at: 6 },
      { span: "tool", trace: "render", path: "/render/tool", verb: "fault", at: 7, data: { message: "boom", code: null } },
      { span: "render", trace: null, path: "/render", verb: "close", at: 9 },
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
    specimen.expect(capture.pojo[0].children[1].fault).toEqual({ at: 7, message: "boom", code: null });
  });
});
