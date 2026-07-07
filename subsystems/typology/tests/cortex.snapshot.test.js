// snapshot demo · cortex — the faculty repository (type → Faculty[]) as data.
// Step 1: DRY — console.log the pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, Cortex } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

describe("snapshot demo: cortex", () => {
  // cortex — faculties live in a Map (fold flattens to {}) → parse-override to expand the repository
  it("captures cortex", () => {
    const cortex = new Cortex().register([
      {
        type: "dialogue",
        tune: [0.9, 1.0, 0.3, 0.5],
        channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
        via: { render: async () => ({}), stream: async function* () {} },
      },
      {
        type: "speech",
        tune: [0.3, 0.8, 0.7, 0.2],
        channels: { in: ["text"], out: ["audio"] },
        via: { render: async () => ({}) },
      },
      {
        type: "object",
        tune: [0.3, 0.7, 0.8, 0.5],
        channels: { in: ["text"], out: ["object"] },
        via: { render: async () => ({}) },
      },
    ]);

    const { pojo, path } = snapshot(cortex, {
      base,
      dry: DRY,
      locate: "cortex.snapshot.json",
      parse: (c) => ({
        faculties: Object.fromEntries(
          [...c.faculties].map(([type, list]) => [
            type,
            list.map(({ type, tune, channels, via }) => ({
              type,
              tune,
              channels,
              via: Object.keys(via),
            })),
          ]),
        ),
      }),
    });
    console.log(`\n===BEGIN cortex → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo.faculties.dialogue).toHaveLength(1);
    expect(pojo.faculties.dialogue[0].via).toEqual(["render", "stream"]);
    expect(pojo.faculties.speech[0].channels.out).toEqual(["audio"]);
    expect(Object.keys(pojo.faculties)).toEqual(["dialogue", "speech", "object"]);
  });
});
