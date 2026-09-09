import { join } from "@std/path";
import {
  fromm,
  shard,
  specimen,
  steer,
  ToolCall,
  Vector,
} from "@vivalence/typology";
import { research } from "../tools/research.js";
import { calling, rig, saying, SOURCE } from "./rig.js";
import { pin } from "./harness.snapshot.test.js";

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;

const invoke = (rigged, input) => {
  const outer = new Vector().slurp(research);
  outer.use(shard.context.bind("daemon", rigged.daemon));
  outer.use(shard.context.bind("mode", rigged.mode));
  outer.use(shard.context.bind("thread", "thread-1"));
  return steer.dispatch.invoke(
    outer,
    new ToolCall("research").signal,
    steer.strategy.guarded,
  )(input);
};

specimen.describe(
  "hello-world research snapshot — the nested request and what leaves it",
  () => {
    specimen.it(
      "S4: the INNER request as lowering built it, and the OUTER projected yield",
      async () => {
        const rigged = await rig([
          calling("generator_view_render", {
            source: SOURCE,
            label: { name: "Flamingo" },
            data: { title: "Flamingo" },
          }),
          saying("Flamingos are pink from what they eat."),
        ]);
        const spoken = fromm.yield(
          await invoke(rigged, {
            subject: "flamingo",
            brief: "The operator wants to keep a page on flamingos.",
          }),
        );
        const [inner] = rigged.seen;

        pin(
          {
            inner: {
              system: Object.entries(inner.system).map((
                [key, text],
              ) => [key, text.length]),
              tools: inner.tools.map(({ name }) => name),
              cache: inner.cache,
              policy: inner.policy ?? null,
            },
            outer: {
              condition: spoken.condition,
              keys: Object.keys(spoken.output).sort(),
              buffer: spoken.output.buffer.map(({ data, view, index }) => ({
                data,
                view,
                index,
              })),
            },
          },
          "hello-world-research.snapshot.json",
        );
      },
    );

    specimen.it(
      "S4 ⊇ S1: the researcher rides the same harness, so every door the mode arms reaches it",
      () => {
        const S4 = JSON.parse(
          Deno.readTextFileSync(
            join(SNAPSHOTS, "hello-world-research.snapshot.json"),
          ),
        );
        const S1 = JSON.parse(
          Deno.readTextFileSync(
            join(SNAPSHOTS, "hello-world-catalog.snapshot.json"),
          ),
        );
        const outer = S1.map(({ name }) => name);
        const inner = S4.inner.tools;
        const declared = outer.filter((name) =>
          name.startsWith("web_") || name.startsWith("generator_")
        );
        for (const name of declared) specimen.expect(inner).toContain(name);
        specimen.expect(inner.slice(0, 6)).toEqual([
          "entity_schema",
          "entity_find",
          "entity_count",
          "buffer_update",
          "buffer_label",
          "thread_update",
        ]);
      },
    );
  },
);
