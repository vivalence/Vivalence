import { specimen, Vector } from "@vivalence/typology";
import { ThreadEntity, traits } from "@vivalence/runtime";
import { create } from "./scenarios/cortex.js";

const { CONVERSATION, TOOLING, PRIMER } = traits.mode;

const STARTER = {
  HARNESSED: { tier: "fast", rounds: 6 },
  CONVERSATIONAL: { language: ["it"], polish: { engaged: false } },
  TOOLED: { "/daemon/house/mode/teacher/dewey": "eager" },
  PRIMED: { "/daemon/house/mode/teacher/dewey/voice": "lazy" },
};
const FILLED = {
  HARNESSED: { tier: "fast", effort: "low", rounds: 6, slugging: "deep" },
  CONVERSATIONAL: { language: ["it"], hear: {}, speak: {}, call: {}, polish: { engaged: false } },
  TOOLED: { "/daemon/house/mode/teacher/dewey": "eager" },
  PRIMED: { "/daemon/house/mode/teacher/dewey/voice": "lazy" },
};
const TWINS = Object.keys(FILLED);

let scenario;

specimen.describe("a thread's starter — each mode trait seeds its own twin on the mode's twitch (m126 Q40 · Q47)", () => {
  specimen.beforeAll(async () => {
    scenario = await create();
    const { dewey } = scenario;
    dewey.module.primer = new Vector();
    CONVERSATION(dewey);
    TOOLING(dewey);
    PRIMER(dewey);
    dewey.trait = STARTER;
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  const stored = (thread) => scenario.em.fork().findOneOrFail(ThreadEntity, { id: thread.id }, { filters: false });
  const twins = (thread) => Object.fromEntries(TWINS.map((twin) => [twin, thread.trait[twin]]));
  const loose = async (held = {}) => {
    const thread = scenario.em.create(ThreadEntity, { user: scenario.fixtures.user, mode: null, trait: {}, counter: 0, ...held });
    await scenario.em.flush();
    return thread;
  };

  specimen.it("born on the mode: it wears the four twins, each the mode entry's config, stored", async () => {
    const born = await stored(await scenario.createThread());
    specimen.expect(born.traits).toEqual(TWINS);
    specimen.expect(twins(born)).toEqual(FILLED);
  });

  specimen.it("born with no mode it wears none; moved onto the mode, it is seeded at the move", async () => {
    const thread = await loose();
    specimen.expect((await stored(thread)).traits).toEqual([]);
    thread.mode = scenario.dewey.entity;
    await scenario.em.flush();
    const moved = await stored(thread);
    specimen.expect(moved.traits).toEqual(TWINS);
    specimen.expect(twins(moved)).toEqual(FILLED);
  });

  specimen.it("a twin it already wears is kept through the move, the others are seeded", async () => {
    const thread = await loose({ traits: ["HARNESSED", "TOOLED"], trait: { HARNESSED: { tier: "balanced" }, TOOLED: {} } });
    thread.mode = scenario.dewey.entity;
    await scenario.em.flush();
    const moved = await stored(thread);
    specimen.expect(moved.traits).toEqual(["HARNESSED", "TOOLED", "CONVERSATIONAL", "PRIMED"]);
    specimen.expect(moved.trait.HARNESSED).toEqual({ tier: "balanced", effort: "low", rounds: 12, slugging: "deep" });
    specimen.expect(moved.trait.TOOLED).toEqual({});
    specimen.expect([moved.trait.CONVERSATIONAL, moved.trait.PRIMED]).toEqual([FILLED.CONVERSATIONAL, FILLED.PRIMED]);
  });

  specimen.it("a mode entry with no config seeds the bare word: the schematic's fill alone", async () => {
    scenario.dewey.trait = {};
    const bare = await stored(await scenario.createThread());
    scenario.dewey.trait = STARTER;
    specimen.expect(bare.traits).toEqual(TWINS);
    specimen.expect(bare.trait.HARNESSED).toEqual({ tier: "capable", effort: "low", rounds: 12, slugging: "deep" });
    specimen.expect([bare.trait.TOOLED, bare.trait.PRIMED]).toEqual([{}, {}]);
  });
});
