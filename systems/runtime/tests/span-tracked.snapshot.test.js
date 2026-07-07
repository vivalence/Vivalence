// span (tracked) · the live span spine — shard.track builds a real timed trace during a
// middleware dispatch (the mechanism systems/ghost mounts on ctx.span), drained to a Pipe.
import { specimen, Pipe, middleware, shard } from "@vivalence/typology";

const { track } = shard;
const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

const stable = (node) => {
  const { timing, children, ...rest } = node;
  const out = { ...rest };
  if (timing) out.timing = { measured: timing.begun != null && timing.sealed != null };
  if (children) out.children = children.map(stable);
  return out;
};

describe("span snapshot: the tracked spine (shard.track)", () => {
  it("captures a live timed span tree", async () => {
    const spans = [];
    const pipe = new Pipe();
    pipe.tap((span) => spans.push(span));

    const chain = middleware.compose([
      track.span("render", pipe),
      track.subject("dialogue", "turn-1"),
      track.span("provider"),
      track.span("translate"),
    ]);

    await chain({}, async () => {});

    const root = spans[0];
    expect(typeof root.timing.begun).toBe("number");
    expect(typeof root.timing.sealed).toBe("number");

    const { pojo, path } = snapshot(root, {
      base,
      dry: DRY,
      locate: "span-tracked.snapshot.json",
      parse: (s) => stable(s.json),
    });
    console.log(`\n===BEGIN span-tracked → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo.nature).toBe("render");
    expect(pojo.subject).toEqual({ schema: "dialogue", id: "turn-1" });
    expect(pojo.timing).toEqual({ measured: true });
    expect(pojo.children[0].nature).toBe("provider");
    expect(pojo.children[0].children[0].nature).toBe("translate");
  });
});
