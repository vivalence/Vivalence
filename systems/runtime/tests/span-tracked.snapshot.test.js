import { specimen, Pipe, middleware, shard, trace } from "@vivalence/typology";

const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

const stable = (node) => {
  const out = { path: node.path, nature: node.nature };
  if (node.timing) out.timing = { measured: node.timing.begun != null && node.timing.sealed != null };
  if (node.entries.length) out.entries = node.entries.map((entry) => ({ verb: entry.verb, data: entry.data }));
  if (node.children.length) out.children = node.children.map(stable);
  return out;
};

specimen.describe("trace: the tracked spine (shard.track)", () => {
  specimen.it("a middleware dispatch writes a chronicle", async () => {
    const records = [];
    const pipe = new Pipe();
    pipe.tap((record) => records.push(record));

    const chain = middleware.compose([
      shard.track.span("render", pipe),
      shard.track.subject("dialogue", "turn-1"),
      shard.track.span("provider"),
      shard.track.span("translate"),
    ]);

    await chain({}, async () => {});

    const story = trace.chronicle(records);
    const root = story.roots[0];
    specimen.expect(trace.duration(root)).not.toBe(null);
    specimen.expect(root.entries[0].verb).toBe("subject");
    specimen.expect(root.entries[0].data).toEqual({ schema: "dialogue", id: "turn-1" });
    specimen.expect(root.children[0].nature).toBe("provider");
    specimen.expect(root.children[0].children[0].nature).toBe("translate");

    const capture = specimen.snapshot(story.roots, {
      base,
      dry: DRY,
      locate: "span-tracked.snapshot.json",
      parse: (roots) => roots.map(stable),
    });
    console.log(`\n===BEGIN span-tracked → ${capture.path}===\n${JSON.stringify(capture.pojo, null, 2)}\n===END===\n`);
    specimen.expect(capture.pojo[0].timing).toEqual({ measured: true });
    specimen.expect(capture.pojo[0].children[0].children[0].timing).toEqual({ measured: true });
  });
});
