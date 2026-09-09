import {
  fromm,
  shard,
  specimen,
  steer,
  ToolCall,
  Vector,
} from "@vivalence/typology";
import { research, ROUNDS } from "../tools/research.js";
import { calling, rig, saying, SOURCE } from "./rig.js";

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

const ASK = {
  brief:
    "Flamingos. The operator runs a demo instance and wants to keep a page on them.",
};

const DRAW = calling("generator_view_render", {
  source: SOURCE,
  label: { name: "Flamingo" },
  data: { title: "Flamingo" },
});
const PEEK = calling("generator_view_inspect", { hash: "h000000000000000" });

specimen.describe(
  "research — the first NESTED hallucination under test",
  () => {
    specimen.it(
      "P-yield: a buffer minted inside the inner agent surfaces in the OUTER yield, and NOTHING else does",
      async () => {
        // three inner rounds: draw · inspect · summarise. inspect lands `object` on the inner
        // fold — the payload word that must NOT leave — and web_read would have landed url[],
        // markdown[], links[] the same way. only message + buffer cross.
        const rigged = await rig([
          DRAW,
          PEEK,
          saying("Flamingos are pink from what they eat."),
        ]);
        const spoken = fromm.yield(await invoke(rigged, ASK));

        specimen.expect(spoken.condition).toBe("NOMINAL");
        specimen.expect(Object.keys(spoken.output).sort()).toEqual([
          "buffer",
          "message",
        ]);
        specimen.expect(spoken.output.buffer.length).toBe(1);
        specimen.expect(spoken.output.message).toBe(
          "Flamingos are pink from what they eat.",
        );
        specimen.expect(rigged.seen.length).toBe(3);
      },
    );

    specimen.it(
      "P-nodoublebind holds through the nesting — one page, counter +1",
      async () => {
        const rigged = await rig([DRAW, saying("done")]);
        const spoken = fromm.yield(await invoke(rigged, ASK));
        specimen.expect(spoken.output.buffer[0].thread).toBe(rigged.row);
        specimen.expect(spoken.output.buffer[0].index).toBe(0);
        specimen.expect(rigged.row.counter).toBe(1);
      },
    );

    specimen.it(
      "P-catalog: the researcher rides the mode's harness, so it arms the mode's own catalog",
      async () => {
        const rigged = await rig([saying("nothing to do")]);
        await invoke(rigged, ASK);
        const [request] = rigged.seen;
        specimen.expect(request.tools.map(({ name }) => name)).toEqual([
          "entity_schema",
          "entity_find",
          "entity_count",
          "buffer_update",
          "buffer_label",
          "thread_update",
          "web_search",
          "web_read",
          "generator_view_render",
          "generator_view_revise",
          "generator_view_inspect",
          "generator_view_list",
        ]);
        specimen.expect(Object.keys(request.system)).toEqual(["brief"]);
        specimen.expect(request.turns.at(-1).parts[0].text).toBe(ASK.brief);
      },
    );

    specimen.it(
      "P-early: rounds run out AFTER a draw — ERROR, and the page still comes back",
      async () => {
        // draw once, then inspect forever. render() would have thrown the fold away here.
        const rigged = await rig([DRAW, PEEK]);
        const spoken = fromm.yield(await invoke(rigged, ASK));

        specimen.expect(spoken.condition).toBe("ERROR");
        specimen.expect(spoken.output.buffer.length).toBe(1);
        specimen.expect(spoken.output.message).toContain("stopped early");
        specimen.expect(spoken.output.message).toContain(
          `length after ${ROUNDS} rounds`,
        );
        specimen.expect(spoken.output.message).toContain(
          "answer from what is on screen",
        );
        specimen.expect(rigged.seen.length).toBe(ROUNDS);
        specimen.expect(rigged.row.counter).toBe(1);
      },
    );

    specimen.it(
      "P-early: a provider fault mid-research keeps the page and names the fault",
      async () => {
        const rigged = await rig([DRAW, new Error("upstream 529")]);
        const spoken = fromm.yield(await invoke(rigged, ASK));

        specimen.expect(spoken.condition).toBe("ERROR");
        specimen.expect(spoken.output.buffer.length).toBe(1);
        specimen.expect(spoken.output.message).toContain(
          "error after 2 rounds",
        );
        specimen.expect(spoken.output.message).toContain("upstream 529");
      },
    );

    specimen.it("P-early: stopping before any draw says so", async () => {
      const rigged = await rig([new Error("upstream 529")]);
      const spoken = fromm.yield(await invoke(rigged, ASK));
      specimen.expect(spoken.output.buffer).toEqual([]);
      specimen.expect(spoken.output.message).toContain("drew nothing");
    });
  },
);
