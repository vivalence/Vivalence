import { assertEquals, assertRejects } from "@std/assert";
import { TurnEntity, UserEntity } from "@vivalence/runtime";
import { seed } from "./scenarios/datamap.js";

const text = (turn) => turn.parts[0].text;

Deno.test("turn.scope — a bound user reads only the turns of their own threads", async (t) => {
  const { orm, em, repos, fixtures } = await seed();
  const intruder = em.create(UserEntity, { slug: "intruder" });
  await em.flush();

  const ours = repos.thread.create({ user: fixtures.user, mode: fixtures.mode });
  await em.flush();
  await repos.turn.chain({ thread: ours.id, role: "user", parts: [{ type: "text", text: "ciao" }], mode: fixtures.mode });

  em.setFilterParams("user", { user: intruder.id });
  const theirs = repos.thread.create({ user: intruder, mode: fixtures.mode });
  await em.flush();
  const secret = await repos.turn.chain({ thread: theirs.id, role: "user", parts: [{ type: "text", text: "secret" }], mode: fixtures.mode });
  em.setFilterParams("user", { user: fixtures.user.id });

  await t.step("a find answers the bound user's turns alone", async () => {
    assertEquals((await em.fork().find(TurnEntity, {})).map(text), ["ciao"]);
  });

  await t.step("a where naming another user's thread cannot widen the scope", async () => {
    assertEquals(await em.fork().find(TurnEntity, { thread: theirs.id }), []);
  });

  await t.step("another user's turn is not found by id", async () => {
    assertEquals(await em.fork().findOne(TurnEntity, secret.id), null);
  });

  await t.step("history on another user's thread is empty", async () => {
    assertEquals(await em.fork().getRepository(TurnEntity).history({ thread: theirs.id }), []);
  });

  await t.step("a turn cannot be chained onto another user's thread", async () => {
    await assertRejects(() => em.fork().getRepository(TurnEntity).chain({ thread: theirs.id, role: "user", parts: [] }));
  });

  await t.step("a lookup waiving the filter reads every user's turns", async () => {
    assertEquals((await em.fork().find(TurnEntity, {}, { filters: { user: false } })).map(text).sort(), ["ciao", "secret"]);
  });

  await t.step("a turn chains without a mode — the mode is optional", async () => {
    const bare = await repos.turn.chain({ thread: ours.id, role: "assistant", parts: [{ type: "text", text: "salve" }] });
    assertEquals((await em.fork().findOneOrFail(TurnEntity, bare.id)).mode, null);
  });

  await t.step("with no user bound, a turn read refuses", async () => {
    const unbound = em.fork();
    unbound.setFilterParams("user", undefined);
    await assertRejects(() => unbound.find(TurnEntity, {}), Error, "No arguments provided for filter 'user'");
  });

  await orm.close();
});
