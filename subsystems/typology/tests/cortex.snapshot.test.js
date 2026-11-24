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
        id: "dialogue-1",
        tune: [0.9, 0.3, 0.5],
        channels: {
          stream: {
            in: [{ type: "text" }, { type: "tool_result" }, { type: "tool_use" }],
            out: [{ type: "text" }, { type: "tool_use" }],
            via: async function* () {},
          },
          render: {
            in: [{ type: "text" }, { type: "tool_result" }, { type: "tool_use" }],
            out: [{ type: "text" }, { type: "tool_use" }],
            via: async () => ({}),
          },
        },
      },
      {
        type: "speech",
        id: "speech-2",
        tune: [0.3, 0.7, 0.2],
        channels: {
          render: {
            in: [{ type: "text" }],
            out: [{ type: "audio" }],
            via: async () => ({}),
          },
        },
      },
      {
        type: "object",
        id: "object-3",
        tune: [0.3, 0.8, 0.5],
        channels: {
          render: {
            in: [{ type: "text" }],
            out: [{ type: "object" }],
            via: async () => ({}),
          },
        },
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
            list.map(({ type, tune, channels }) => ({
              type,
              tune,
              channels,
            })),
          ]),
        ),
      }),
    });
    console.log(`\n===BEGIN cortex → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo.faculties.dialogue).toHaveLength(1);
    expect(Object.keys(pojo.faculties.dialogue[0].channels)).toEqual(["stream", "render"]);
    expect(pojo.faculties.speech[0].channels.render.out).toEqual([{ type: "audio" }]);
    expect(Object.keys(pojo.faculties)).toEqual(["dialogue", "speech", "object"]);
  });
});
