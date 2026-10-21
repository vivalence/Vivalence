import { specimen } from "@vivalence/typology";
import { ThreadEntity, TurnEntity } from "@vivalence/runtime";
import { seed } from "../scenarios/datamap.js";

// Turn on :memory: — create binds the thread row or fails loud, history is the ana (createdAt ASC), chain parents on the
// last turn, fold is the cata: a verdict compacts the tract onto its last row, no verdict prunes it whole

let scenario;
let thread;

const reload = (id, populate) => scenario.em.fork().findOneOrFail(TurnEntity, { id }, { populate });

specimen.describe("Turn — create · history · chain · fold", () => {
  specimen.beforeAll(async () => {
    scenario = await seed();
    thread = scenario.em.create(ThreadEntity, { user: scenario.fixtures.user, mode: scenario.fixtures.mode, traits: [] });
    await scenario.em.flush();
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("create binds the thread by id; an unknown thread fails loud before any row", async () => {
    const { repos, em } = scenario;
    const turn = await repos.turn.create({ thread: thread.id, role: "user", parts: [{ type: "text", text: "ciao" }] });
    await em.flush();
    specimen.expect((await reload(turn.id)).thread.id).toBe(thread.id);
    await specimen.expect(repos.turn.create({ thread: "nobody", role: "user" })).rejects.toThrow();
  });

  specimen.it("chain parents each turn on the thread's last; history answers them oldest first", async () => {
    const { repos } = scenario;
    const [first] = await repos.turn.history({ thread: thread.id });
    const reply = await repos.turn.chain({ thread: thread.id, role: "assistant", parts: [] });
    const next = await repos.turn.chain({ thread: thread.id, role: "user", parts: [] });
    specimen.expect(reply.parent.id).toBe(first.id);
    specimen.expect(next.parent.id).toBe(reply.id);
    specimen.expect((await repos.turn.history({ thread: thread.id })).map((turn) => turn.role)).toEqual(["user", "assistant", "user"]);
    const explicit = await repos.turn.chain({ thread: thread.id, role: "assistant", parts: [], parent: first });
    specimen.expect(explicit.parent.id).toBe(first.id);
  });

  specimen.it("fold with a verdict keeps the tract's last row as the anchor, rewritten in place and unparented; the rest are removed", async () => {
    const { repos, em } = scenario;
    const tract = (await repos.turn.history({ thread: thread.id })).slice(0, 3);
    const ids = tract.map((turn) => turn.id);
    const anchor = await repos.turn.fold(tract, async (held) => ({ role: "assistant", parts: [{ type: "text", text: `${held.length} turns compacted` }] }));
    specimen.expect(anchor.id).toBe(ids[2]);
    specimen.expect(anchor.parent ?? null).toBe(null);
    const stored = await reload(ids[2]);
    specimen.expect(stored.parent ?? null).toBe(null);
    specimen.expect(stored.parts).toEqual([{ type: "text", text: "3 turns compacted" }]);
    specimen.expect(await em.fork().count(TurnEntity, { id: { $in: ids.slice(0, 2) } })).toBe(0);
  });

  specimen.it("fold without a verdict prunes the whole tract and answers null", async () => {
    const { repos, em } = scenario;
    const tract = await repos.turn.history({ thread: thread.id });
    specimen.expect(tract.length).toBeGreaterThan(0);
    specimen.expect(await repos.turn.fold(tract, async () => null)).toBe(null);
    specimen.expect(await em.fork().count(TurnEntity, { thread: thread.id })).toBe(0);
  });
});
