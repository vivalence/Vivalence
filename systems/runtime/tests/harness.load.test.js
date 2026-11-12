import { belt, Path, shard, specimen, steer, ToolCall, v, Vector } from "@vivalence/typology";
import { gestalten, ThreadEntity } from "@vivalence/runtime";
import { seed } from "./scenarios/datamap.js";
import { accio } from "./scenarios/registry.js";

const { Tool } = v.primitives.hallucination;

const said = (nature, valence, output = {}) => new Vector().open({ nature, valence }, () => ({ output }));

const harvest = {
  manifest: { type: "tactic", slug: "harvest", description: "Harvests a corpus into the dataset." },
  tools: new Vector()
    .open(
      {
        nature: "/drain",
        valence: "Writes the daemon's truth back to the dataset files.",
        input: v.object({ topography: v.string() }),
      },
      () => ({ output: { drained: true } }),
    )
    .open({ nature: "/stage", valence: "Stages a harvest." }, () => ({ output: { staged: true } })),
  primer: new Vector().open({ nature: "archivist", valence: "the harvest persona" }, () => "# the archivist"),
};
const nyan = {
  manifest: { type: "game", slug: "nyan", description: "A typing trainer." },
  tools: said("/play", "Opens the trainer."),
};
const francesca = {
  manifest: { type: "teacher", slug: "francesca", description: "An Italian teacher." },
  tools: said("/drill/deal", "Deals a drill."),
  primer: new Vector().open({ nature: "role", valence: "who she is" }, () => "You are Francesca."),
};
const coach = {
  manifest: { type: "teacher", slug: "coach", description: "A chess coach." },
  tools: new Vector().open({ nature: "/whoami", valence: "Says who." }, (ctx) => ({
    output: { daemon: ctx.daemon.reference.absolute, mode: ctx.mode.manifest.slug },
  })),
};

specimen.describe("the five load tools — read through gestalten.reference, written onto the thread's TOOLED · PRIMED", () => {
  let orm;
  let em;
  let fixtures;
  let harness;

  specimen.beforeAll(async () => {
    ({ orm, em, fixtures } = await seed());
    harness = await accio("@commons/harness/runtime");
  });

  specimen.afterAll(async () => {
    await orm.close();
  });

  const world = async () => {
    const thread = em.create(ThreadEntity, { user: fixtures.user, mode: fixtures.mode });
    await em.flush();
    const education = {
      reference: new Path("/daemon/education"),
      modes: { tactic: { harvest }, game: { nyan }, teacher: { francesca } },
    };
    const chess = { reference: new Path("/daemon/chess"), modes: { teacher: { coach } } };
    const runtime = {
      reference: new Path("/runtime/runtime"),
      modes: { harness: { runtime: { manifest: harness.manifest, tools: harness.tools, primer: harness.primer } } },
      daemons: { education, chess },
    };
    const tools = new Vector().graft(gestalten.tools.modes, gestalten.tools.tool, gestalten.tools.primer);
    const ctx = { tools, runtime, daemon: education, reference: education.reference, mode: francesca, thread, entities: { em } };
    for (const [key, held] of Object.entries(ctx)) tools.use(shard.context.bind(key, held));
    const call = async (name, input) =>
      (await steer.dispatch.invoke(tools, new ToolCall(name), steer.strategy.guarded)(input)).output;
    const names = () => belt.hallucinate.declarations(tools).map((held) => held.name);
    const stored = async () => (await em.fork().findOneOrFail(ThreadEntity, { id: thread.id }, { filters: false })).trait;
    return { ctx, call, names, stored };
  };

  specimen.it("Q20 · Q24B · Q32 — modes_index lists what a reference covers, at three details, writes nothing", async () => {
    const { call, stored } = await world();
    const answers = {
      modes: await call("modes_index", { reference: "/daemon/education", detail: "modes" }),
      outline: await call("modes_index", { reference: "/tactic" }),
      signatures: await call("modes_index", { reference: "/daemon/education/mode/game", detail: "signatures" }),
    };
    console.log(JSON.stringify(answers, null, 2));
    specimen.expect(answers).toEqual({
      modes: {
        modes: [
          { reference: "/daemon/education/mode/tactic/harvest", valence: "Harvests a corpus into the dataset." },
          { reference: "/daemon/education/mode/game/nyan", valence: "A typing trainer." },
          { reference: "/daemon/education/mode/teacher/francesca", valence: "An Italian teacher." },
        ],
      },
      outline: {
        modes: [
          {
            reference: "/daemon/education/mode/tactic/harvest",
            valence: "Harvests a corpus into the dataset.",
            tools: [
              { reference: "/daemon/education/mode/tactic/harvest/drain", valence: "Writes the daemon's truth back to the dataset files." },
              { reference: "/daemon/education/mode/tactic/harvest/stage", valence: "Stages a harvest." },
            ],
            primers: [{ reference: "/daemon/education/mode/tactic/harvest/archivist", valence: "the harvest persona" }],
          },
        ],
      },
      signatures: {
        modes: [
          {
            reference: "/daemon/education/mode/game/nyan",
            valence: "A typing trainer.",
            tools: [{ reference: "/daemon/education/mode/game/nyan/play", valence: "Opens the trainer.", input: undefined, output: undefined }],
            primers: [],
          },
        ],
      },
    });
    specimen.expect((await stored()).TOOLED).toEqual({});
  });

  specimen.it("Q14 · Q21 · Q25A · Q35 — tool_load seats a leaf and a tree, answers their declarations whole, keys what it ADDED", async () => {
    const { call, names, stored } = await world();
    const answer = await call("tool_load", { references: ["/tactic/harvest/drain", "/runtime/runtime/mode/harness/runtime/fs"] });
    const TOOLED = (await stored()).TOOLED;
    console.log(JSON.stringify({ answer, declared: names(), TOOLED }, null, 2));
    specimen.expect(answer.missed).toEqual([]);
    specimen.expect(answer.tools[0]).toEqual({
      name: "tactic_harvest_drain",
      valence: "Writes the daemon's truth back to the dataset files.",
      input: harvest.tools.edge("drain")[0].input,
    });
    specimen.expect(answer.tools.slice(1).map((held) => held.name)).toEqual(
      steer.trie.leaves(steer.trie.at(harness.tools, ["fs"])).map(({ steps }) => `runtime_harness_runtime_fs_${steps.map((step) => step.nature.replace(/^\//, "")).join("_")}`),
    );
    for (const held of answer.tools) specimen.expect(held).matches(Tool);
    specimen.expect(TOOLED).toEqual({
      "/daemon/education/mode/tactic/harvest/drain": "eager",
      "/runtime/runtime/mode/harness/runtime/fs": "eager",
    });
    specimen.expect(await call("tactic_harvest_drain", { topography: "words" })).toEqual({ drained: true });
  });

  specimen.it("Q16 — tool_unload trims the live tree and the key; a leaf under a loaded tree is kept out as none, the home's own default too", async () => {
    const { call, names, stored } = await world();
    await call("tool_load", { references: ["/tactic/harvest/drain", "/runtime/runtime/mode/harness/runtime/fs"] });
    const answers = {
      leaf: await call("tool_unload", { references: ["/runtime/runtime/mode/harness/runtime/fs/delete"] }),
      mode: await call("tool_unload", { references: ["/tactic/harvest/drain"] }),
      home: await call("tool_unload", { references: ["/drill/deal"] }),
    };
    const TOOLED = (await stored()).TOOLED;
    console.log(JSON.stringify({ answers, declared: names(), TOOLED }, null, 2));
    specimen.expect(answers).toEqual({
      leaf: { unloaded: ["/runtime/runtime/mode/harness/runtime/fs/delete"], missed: [] },
      mode: { unloaded: ["/daemon/education/mode/tactic/harvest/drain"], missed: [] },
      home: { unloaded: ["/daemon/education/mode/teacher/francesca/drill/deal"], missed: [] },
    });
    specimen.expect(TOOLED).toEqual({
      "/runtime/runtime/mode/harness/runtime/fs": "eager",
      "/runtime/runtime/mode/harness/runtime/fs/delete": "none",
      "/daemon/education/mode/teacher/francesca/drill/deal": "none",
    });
    specimen.expect(names().includes("runtime_harness_runtime_fs_delete")).toBe(false);
    specimen.expect(names().includes("tactic_harvest_drain")).toBe(false);
    specimen.expect(names().includes("runtime_harness_runtime_fs_read")).toBe(true);
  });

  specimen.it("primer_preload lists sections lazy; primer_unload keys none where a key or the home's default carries, drops a key nothing carries", async () => {
    const { call, stored } = await world();
    const listed = await call("primer_preload", { references: ["/tactic/harvest"] });
    const lazy = (await stored()).PRIMED;
    const answers = {
      own: await call("primer_unload", { references: ["/role"] }),
      lazy: await call("primer_unload", { references: ["/tactic/harvest"] }),
    };
    const PRIMED = (await stored()).PRIMED;
    console.log(JSON.stringify({ listed, lazy, answers, PRIMED }, null, 2));
    specimen.expect(listed).toEqual({
      primers: [{ reference: "/daemon/education/mode/tactic/harvest/archivist", valence: "the harvest persona" }],
      missed: [],
    });
    specimen.expect(lazy).toEqual({ "/daemon/education/mode/tactic/harvest": "lazy" });
    specimen.expect(answers).toEqual({
      own: { unloaded: ["/daemon/education/mode/teacher/francesca/role"], missed: [] },
      lazy: { unloaded: ["/daemon/education/mode/tactic/harvest"], missed: [] },
    });
    specimen.expect(PRIMED).toEqual({ "/daemon/education/mode/teacher/francesca/role": "none" });
  });

  specimen.it("Q26 — tool_preload marks lazy, declares nothing, never demotes an eager key", async () => {
    const { call, names, stored } = await world();
    await call("tool_load", { references: ["/runtime/runtime/mode/harness/runtime/fs"] });
    const before = names();
    const answer = await call("tool_preload", { references: ["/tactic/harvest", "/runtime/runtime/mode/harness/runtime/fs/read"] });
    const TOOLED = (await stored()).TOOLED;
    console.log(JSON.stringify({ answer, TOOLED }, null, 2));
    specimen.expect(answer).toEqual({
      tools: [
        { reference: "/daemon/education/mode/tactic/harvest/drain", valence: "Writes the daemon's truth back to the dataset files." },
        { reference: "/daemon/education/mode/tactic/harvest/stage", valence: "Stages a harvest." },
        {
          reference: "/runtime/runtime/mode/harness/runtime/fs/read",
          valence: steer.trie.at(harness.tools, ["fs"]).edge("read")[0].valence,
        },
      ],
      missed: [],
    });
    specimen.expect(TOOLED).toEqual({
      "/runtime/runtime/mode/harness/runtime/fs": "eager",
      "/daemon/education/mode/tactic/harvest": "lazy",
    });
    specimen.expect(names()).toEqual(before);
  });

  specimen.it("Q30 · Q31 — primer_load answers the sections the system prompt gets, keys PRIMED", async () => {
    const { call, stored } = await world();
    const answers = {
      sibling: await call("primer_load", { references: ["/tactic/harvest"] }),
      own: await call("primer_load", { references: ["/role"] }),
    };
    const PRIMED = (await stored()).PRIMED;
    console.log(JSON.stringify({ answers, PRIMED }, null, 2));
    specimen.expect(answers).toEqual({
      sibling: { primers: { "tactic/harvest/archivist": "# the archivist" }, missed: [] },
      own: { primers: { role: "You are Francesca." }, missed: [] },
    });
    specimen.expect(PRIMED).toEqual({
      "/daemon/education/mode/tactic/harvest": "eager",
      "/daemon/education/mode/teacher/francesca/role": "eager",
    });
  });

  specimen.it("Q33 — a reference matching nothing loads the rest and is answered missed, by every tool", async () => {
    const { call, stored } = await world();
    const nowhere = "/nowhere/at/all";
    const answers = {
      tool_load: await call("tool_load", { references: [nowhere, "/game/nyan"] }),
      tool_preload: await call("tool_preload", { references: [nowhere] }),
      primer_load: await call("primer_load", { references: [nowhere] }),
      tool_unload: await call("tool_unload", { references: [nowhere] }),
    };
    console.log(JSON.stringify(answers, null, 2));
    for (const answer of Object.values(answers)) specimen.expect(answer.missed).toEqual([nowhere]);
    specimen.expect(answers.tool_load.tools.map((held) => held.name)).toEqual(["game_nyan_play"]);
    specimen.expect((await stored()).TOOLED).toEqual({ "/daemon/education/mode/game/nyan": "eager" });
  });

  specimen.it("tool_load answers the tools its references reach, step by step: /who never answers /whoami", async () => {
    const { ctx, call } = await world();
    const pair = {
      manifest: { type: "probe", slug: "pair" },
      tools: said("/who", "Says who, short.").open({ nature: "/whoami", valence: "Says who." }, () => ({ output: {} })),
    };
    ctx.runtime.daemons.probe = { reference: new Path("/daemon/probe"), modes: { probe: { pair } } };
    await call("tool_load", { references: ["/daemon/probe/mode/probe/pair/whoami"] });
    const answer = await call("tool_load", { references: ["/daemon/probe/mode/probe/pair/who"] });
    console.log(JSON.stringify(answer.tools.map((held) => held.name)));
    specimen.expect(answer.tools.map((held) => held.name)).toEqual(["daemon_probe_probe_pair_who"]);
  });

  specimen.it("Q21 · Q22 (R14) — /daemon/chess loads another daemon's tree; its tool runs on ITS owner", async () => {
    const { call, names } = await world();
    const answer = await call("tool_load", { references: ["/daemon/chess"] });
    const ran = await call("daemon_chess_teacher_coach_whoami", {});
    console.log(JSON.stringify({ loaded: answer.tools.map((held) => held.name), ran }, null, 2));
    specimen.expect(names().filter((name) => name.startsWith("daemon_"))).toEqual(["daemon_chess_teacher_coach_whoami"]);
    specimen.expect(ran).toEqual({ daemon: "/daemon/chess", mode: "coach" });
  });
});
