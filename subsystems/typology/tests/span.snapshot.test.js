// snapshot demo · span — a Span trace tree (Signature + tracks) captured as its recursive record.
// Step 1: DRY — console.log the pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, Span } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

const slim = (node) => {
  const { timing, children, ...rest } = node;
  const out = { ...rest };
  if (timing && (timing.begun !== null || timing.sealed !== null)) out.timing = timing;
  if (children) out.children = children.map(slim);
  return out;
};

describe("snapshot demo: span", () => {
  // span — recursive .json; auto null-timing slimmed out, only explicit begun/sealed survives
  it("captures span", () => {
    const span = new Span("render");
    const provider = span.log("provider", { model: "opus" });
    provider.timing.begun = 0;
    provider.timing.sealed = 5;
    span.log("translate", { turns: 3 });
    span.log("tool", new Error("boom"));

    const { pojo, path } = snapshot(span, {
      base,
      dry: DRY,
      locate: "span.snapshot.json",
      parse: (s) => slim(s.json),
    });
    console.log(`\n===BEGIN span → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo.timing).toBeUndefined();
    expect(pojo.children).toHaveLength(3);
    expect(pojo.children[0].timing).toEqual({ begun: 0, sealed: 5 });
    expect(pojo.children[1].timing).toBeUndefined();
    expect(pojo.children[2].fault.message).toBe("boom");
  });
});
