import { Path, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { gestalten } from "@vivalence/runtime";
import { accio } from "./scenarios/registry.js";

const { covered, found, keyed, missed, narrow, natures, seat } = gestalten.reference;
const named = (reference) => new ToolCall(natures(reference).map((nature) => ({ nature }))).name;

const leaf = (nature, said) => new Vector().open({ nature, valence: said }, (ctx) => ({
  output: { daemon: ctx.daemon?.reference.absolute ?? null, mode: ctx.mode.manifest.slug },
}));

const world = async () => {
  const harvest = { manifest: { type: "tactic", slug: "harvest" }, tools: leaf("/drain", "Drains the harvest.") };
  const harness = await accio("@commons/harness/runtime");
  const francesca = { manifest: { type: "teacher", slug: "francesca" }, tools: leaf("/drill/deal", "Deals a drill.") };
  const shadow = {
    manifest: { type: "teacher", slug: "shadow" },
    tools: leaf("/tactic/harvest/drain", "The shadow's own drain."),
  };
  const coach = { manifest: { type: "teacher", slug: "coach" }, tools: leaf("/whoami", "Says who.") };
  const editor = { manifest: { type: "guide", slug: "editor" }, tools: leaf("/open", "Opens.") };
  const runtimeMode = { manifest: harness.manifest, tools: harness.tools };
  const education = {
    reference: new Path("/daemon/education"),
    modes: { tactic: { harvest }, teacher: { francesca, shadow } },
  };
  const chess = { reference: new Path("/daemon/chess"), modes: { teacher: { coach } } };
  const runtime = {
    reference: new Path("/runtime/runtime"),
    modes: { harness: { runtime: runtimeMode }, guide: { editor } },
    daemons: { education, chess },
  };
  const thread = { trait: { HARNESSED: { slugging: "deep" } } };
  return {
    francesca: { runtime, daemon: education, reference: education.reference, mode: francesca, thread },
    shadow: { runtime, daemon: education, reference: education.reference, mode: shadow, thread },
    harness: { runtime, reference: runtime.reference, mode: runtimeMode, thread },
  };
};

const DISTANCES = {
  "the runtime": "/runtime/runtime/mode/harness/runtime/fs/read",
  "another daemon": "/daemon/chess/mode/teacher/coach/whoami",
};

specimen.describe("gestalten.reference — the one reader every load tool reads through", () => {
  specimen.it("Q27 · Q34B — from every home a name narrows by distance and widens back; names unique", async () => {
    const homes = await world();
    const table = {};
    const references = {
      francesca: {
        "the same mode": "/daemon/education/mode/teacher/francesca/drill/deal",
        "another mode, same owner": "/daemon/education/mode/tactic/harvest/drain",
        ...DISTANCES,
      },
      harness: {
        "the same mode": "/runtime/runtime/mode/harness/runtime/fs/read",
        "another mode, same owner": "/runtime/runtime/mode/guide/editor/open",
        "another daemon": DISTANCES["another daemon"],
        "a daemon's mode": "/daemon/education/mode/tactic/harvest/drain",
      },
    };
    for (const [home, held] of Object.entries(references)) {
      table[home] = Object.fromEntries(
        Object.entries(held).map(([distance, reference]) => {
          const short = narrow(homes[home], reference);
          const widened = found(homes[home], short).map((entry) => entry.reference);
          return [distance, { short, name: named(short), widened }];
        }),
      );
    }
    console.log(JSON.stringify(table, null, 2));
    specimen.expect(table).toEqual({
      francesca: {
        "the same mode": {
          short: "/drill/deal",
          name: "drill_deal",
          widened: ["/daemon/education/mode/teacher/francesca/drill/deal"],
        },
        "another mode, same owner": {
          short: "/tactic/harvest/drain",
          name: "tactic_harvest_drain",
          widened: ["/daemon/education/mode/tactic/harvest/drain"],
        },
        "the runtime": {
          short: "/runtime/harness/runtime/fs/read",
          name: "runtime_harness_runtime_fs_read",
          widened: ["/runtime/runtime/mode/harness/runtime/fs/read"],
        },
        "another daemon": {
          short: "/daemon/chess/teacher/coach/whoami",
          name: "daemon_chess_teacher_coach_whoami",
          widened: ["/daemon/chess/mode/teacher/coach/whoami"],
        },
      },
      harness: {
        "the same mode": {
          short: "/fs/read",
          name: "fs_read",
          widened: ["/runtime/runtime/mode/harness/runtime/fs/read"],
        },
        "another mode, same owner": {
          short: "/guide/editor/open",
          name: "guide_editor_open",
          widened: ["/runtime/runtime/mode/guide/editor/open"],
        },
        "another daemon": {
          short: "/daemon/chess/teacher/coach/whoami",
          name: "daemon_chess_teacher_coach_whoami",
          widened: ["/daemon/chess/mode/teacher/coach/whoami"],
        },
        "a daemon's mode": {
          short: "/daemon/education/tactic/harvest/drain",
          name: "daemon_education_tactic_harvest_drain",
          widened: ["/daemon/education/mode/tactic/harvest/drain"],
        },
      },
    });
  });

  specimen.it("Q38 (R7) — one name, two tools: the nearest is found and keyed", async () => {
    const homes = await world();
    const own = "/daemon/education/mode/teacher/shadow/tactic/harvest/drain";
    const answers = {
      found: found(homes.shadow, "/tactic/harvest/drain").map((entry) => entry.reference),
      keyed: keyed(homes.shadow, "/tactic/harvest/drain"),
      "from francesca": keyed(homes.francesca, "/tactic/harvest/drain"),
    };
    console.log(JSON.stringify(answers, null, 2));
    specimen.expect(answers).toEqual({
      found: [own],
      keyed: [own],
      "from francesca": ["/daemon/education/mode/tactic/harvest/drain"],
    });
  });

  specimen.it("Q35 · Q37 (R1) — a key runs from root to the node ADDED, never what it found inside", async () => {
    const homes = await world();
    const keys = {
      "a mode": keyed(homes.francesca, "/tactic/harvest"),
      "a leaf": keyed(homes.francesca, "/runtime/harness/runtime/fs/read"),
      "an owner": keyed(homes.francesca, "/daemon/chess"),
    };
    console.log(JSON.stringify(keys, null, 2));
    specimen.expect(keys).toEqual({
      "a mode": ["/daemon/education/mode/tactic/harvest"],
      "a leaf": ["/runtime/runtime/mode/harness/runtime/fs/read"],
      "an owner": ["/daemon/chess"],
    });
    for (const key of Object.values(keys).flat()) specimen.expect(key).toMatch(/^\/(runtime|daemon)\//);
  });

  specimen.it("Q33 (R13) · Q32 — a reference matching nothing is missed; covered lists the modes a reference spans", async () => {
    const homes = await world();
    const answers = {
      missed: missed(homes.francesca, ["/nowhere/at/all", "/tactic/harvest"]),
      covered: covered(homes.francesca, "/daemon/education").map((entry) => entry.reference),
    };
    console.log(JSON.stringify(answers, null, 2));
    specimen.expect(answers).toEqual({
      missed: ["/nowhere/at/all"],
      covered: [
        "/daemon/education/mode/tactic/harvest",
        "/daemon/education/mode/teacher/francesca",
        "/daemon/education/mode/teacher/shadow",
      ],
    });
  });

  specimen.it("Q22 (R14) — a seated tool runs bound to ITS owner and mode, under its narrowed name", async () => {
    const homes = await world();
    const tools = new Vector();
    for (const entry of found(homes.francesca, "/daemon/chess/mode/teacher/coach/whoami")) seat(homes.francesca, tools, entry);
    const names = steer.trie.leaves(tools).map(({ steps }) => new ToolCall(steps).name);
    const ran = await steer.dispatch.invoke(tools, new ToolCall(names[0]), steer.strategy.guarded)({});
    console.log(JSON.stringify({ names, ran: ran.output }, null, 2));
    specimen.expect(names).toEqual(["daemon_chess_teacher_coach_whoami"]);
    specimen.expect(ran.output).toEqual({ daemon: "/daemon/chess", mode: "coach" });
  });
});
