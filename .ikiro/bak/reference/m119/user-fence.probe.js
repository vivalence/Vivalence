import { MikroORM, RequestContext } from "@mikro-orm/core";
import { sets, DaemonEntity, ModeEntity, UserEntity, ThreadEntity, BufferEntity, TerminalEntity } from "@vivalence/runtime";
import { assemble } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/assemble.js";
import { config } from "/Users/finn/vivalence/code/vivalence/commons/datamaps/libsql/libsql.viva.js";

const result = {};
const probe = async (name, fn) => {
  try {
    result[name] = await fn();
  } catch (error) {
    result[name] = { threw: error.constructor.name, message: error.message.slice(0, 160) };
  }
};

const assembled = assemble([
  sets.identity,
  sets.composition,
  sets.traits,
  sets.userspace,
  sets.transient,
]);
const orm = await MikroORM.init(
  config({}, { entities: assembled.entities.map((d) => d.schema), dbName: ":memory:" }),
);
await orm.schema.create();
const em = orm.em;

const as = (user, task) =>
  RequestContext.create(em, async () => {
    const userEm = RequestContext.getEntityManager(em.name);
    userEm.setFilterParams("user", { user });
    return task(userEm);
  });

const seed = em.fork();
const beef = seed.create(UserEntity, { slug: "beef" });
const eve = seed.create(UserEntity, { slug: "eve" });
const daemon = seed.create(DaemonEntity, { slug: "edu" });
const mode = seed.create(ModeEntity, { slug: "italian", type: "language", daemon });
await seed.flush();

const fresh = async () => {
  const fork = em.fork();
  const thread = fork.create(ThreadEntity, { user: eve.id, mode: mode.id, cursor: 0 });
  await fork.flush();
  const buffer = fork.create(BufferEntity, { thread, mode: mode.id });
  await fork.flush();
  return { thread: thread.id, buffer: buffer.id };
};
const untouched = async (ids) => {
  const fork = em.fork();
  const thread = await fork.findOne(ThreadEntity, { id: ids.thread }, { filters: false });
  return thread ? { cursor: thread.cursor, alive: true } : { alive: false };
};

await probe("A em.nativeUpdate(Thread) as beef on eve's row", async () => {
  const ids = await fresh();
  const touched = await as(beef.id, (userEm) =>
    userEm.nativeUpdate(ThreadEntity, { id: ids.thread }, { cursor: 7 }),
  );
  return { touched, after: await untouched(ids) };
});

await probe("B em.nativeDelete(Thread) as beef on eve's row", async () => {
  const ids = await fresh();
  const deleted = await as(beef.id, (userEm) =>
    userEm.nativeDelete(ThreadEntity, { id: ids.thread }),
  );
  return { deleted, after: await untouched(ids) };
});

await probe("C repository.updateOne as beef on eve's row", async () => {
  const ids = await fresh();
  const outcome = await as(beef.id, (userEm) =>
    userEm.getRepository(ThreadEntity).updateOne({ id: ids.thread }, { cursor: 7 }),
  ).catch((error) => ({ threw: error.constructor.name }));
  return { outcome, after: await untouched(ids) };
});

await probe("D repository.update as beef on eve's row", async () => {
  const ids = await fresh();
  const outcome = await as(beef.id, async (userEm) =>
    (await userEm.getRepository(ThreadEntity).update({ id: ids.thread }, { cursor: 7 })).length,
  );
  return { updated: outcome, after: await untouched(ids) };
});

await probe("E repository.removeOne as beef on eve's row", async () => {
  const ids = await fresh();
  const outcome = await as(beef.id, (userEm) =>
    userEm.getRepository(ThreadEntity).removeOne({ id: ids.thread }),
  ).catch((error) => ({ threw: error.constructor.name }));
  return { outcome, after: await untouched(ids) };
});

await probe("F repository.remove as beef on eve's row", async () => {
  const ids = await fresh();
  const outcome = await as(beef.id, async (userEm) =>
    (await userEm.getRepository(ThreadEntity).remove({ id: ids.thread })).length,
  );
  return { removed: outcome, after: await untouched(ids) };
});

await probe("G repository.updateOne as eve on eve's row (control)", async () => {
  const ids = await fresh();
  await as(eve.id, (userEm) =>
    userEm.getRepository(ThreadEntity).updateOne({ id: ids.thread }, { cursor: 7 }),
  );
  return { after: await untouched(ids) };
});

await probe("H Buffer (thread.user fence) nativeUpdate as beef on eve's buffer", async () => {
  const ids = await fresh();
  const touched = await as(beef.id, (userEm) =>
    userEm.nativeUpdate(BufferEntity, { id: ids.buffer }, { index: 9 }),
  );
  return { touched };
});

await probe("I Buffer nativeDelete as beef on eve's buffer", async () => {
  const ids = await fresh();
  const deleted = await as(beef.id, (userEm) => userEm.nativeDelete(BufferEntity, { id: ids.buffer }));
  return { deleted };
});

await probe("J repository.create as beef naming eve as user", async () => {
  const thread = await as(beef.id, async (userEm) => {
    const made = userEm.getRepository(ThreadEntity).create({ user: eve.id, mode: mode.id });
    await userEm.flush();
    return made.id;
  });
  const visibleToBeef = await as(beef.id, (userEm) => userEm.count(ThreadEntity, { id: thread }));
  return { created: true, visibleToBeef };
});

await probe("K repository.create as beef naming beef as user", async () => {
  const thread = await as(beef.id, async (userEm) => {
    const made = userEm.getRepository(ThreadEntity).create({ user: beef.id, mode: mode.id });
    await userEm.flush();
    return made.id;
  });
  return { visibleToBeef: await as(beef.id, (userEm) => userEm.count(ThreadEntity, { id: thread })) };
});

await probe("L repository.create Buffer as beef onto eve's thread", async () => {
  const ids = await fresh();
  return await as(beef.id, async (userEm) => {
    const made = await userEm
      .getRepository(BufferEntity)
      .create({ thread: ids.thread, mode: mode.id });
    await userEm.flush();
    return { created: made.id !== undefined };
  });
});

await probe("M repository.create Terminal as beef naming eve as user", async () => {
  return await as(beef.id, async (userEm) => {
    const made = await userEm.getRepository(TerminalEntity).create({ user: eve.id });
    await userEm.flush();
    return { created: made.id !== undefined, owner: made.user.id === eve.id ? "eve" : "beef" };
  });
});

await orm.close();
console.log(JSON.stringify(result, null, 2));
