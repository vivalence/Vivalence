import { specimen, Vector, shape } from "@vivalence/typology";
import { RequestContext } from "@mikro-orm/core";
import { atom } from "nanostores";
import { VirtualRepository } from "@vivalence/runtime";
import { ThreadEntity } from "@vivalence/runtime";
import { create, ProbeEntity } from "./scenarios/virtual.js";

let world, probe, user, thread;
specimen.beforeAll(async () => {
  world = await create();
  ({ probe } = world.entities);
  ({ user, thread } = world.fixtures);
});
specimen.afterAll(() => world.close());
specimen.afterEach(() => world.as(user, () => probe.remove({})));

specimen.describe("VirtualRepository — the storage is the repository the context holds, and it is reactive", () => {
  specimen.it("named: the ORM knows the kind as virtual, the context holds its repository, $entities is a store", () => {
    specimen.expect(world.orm.getMetadata().get(ProbeEntity).virtual).toBe(true);
    specimen.expect(probe).toBeInstanceOf(VirtualRepository);
    specimen.expect(typeof probe.$entities.subscribe).toBe("function");
    specimen.expect(probe.$entities.get()).toEqual([]);
  });
  specimen.it("instances survive request contexts — two forks, one identity, through the held instance", async () => {
    const born = await world.as(user, () => probe.create({ user: user.id }));
    const seen = await Promise.all([1, 2].map(() =>
      RequestContext.create(world.orm.em, () => world.entities.probe.findOne({ id: born.id }))));
    specimen.expect(seen[0]).toBe(born);
    specimen.expect(seen[1]).toBe(born);
  });
  specimen.it("a copy mikro mints on a fork is NOT the storage — its atom is empty, by design", async () => {
    const born = await world.as(user, () => probe.create({ user: user.id }));
    const twin = world.orm.em.fork().getRepository(ProbeEntity);
    specimen.expect(twin).toBeInstanceOf(VirtualRepository);
    specimen.expect(twin.$entities).not.toBe(probe.$entities);
    specimen.expect(await twin.findOne({ id: born.id })).toBe(null);
  });
  specimen.it("a handed atom is the storage", async () => {
    const mine = atom([]);
    const held = new VirtualRepository(world.orm.em, ProbeEntity, mine);
    const born = await world.as(user, () => held.create({ user: user.id }));
    specimen.expect(mine.get()).toEqual([born]);
    await world.as(user, () => held.remove({}));
  });
  specimen.it("reactive: a subscriber sees create → update → delete as three new arrays", async () => {
    const seen = [];
    const off = probe.$entities.subscribe((entities) => seen.push(entities.length));
    const born = await world.as(user, () => probe.create({ user: user.id }));
    await world.as(user, () => probe.updateOne({ id: born.id }, { status: "HOT" }));
    await world.as(user, () => probe.removeOne({ id: born.id }));
    off();
    specimen.expect(seen).toEqual([0, 1, 1, 0]);                             // subscribe fires once with the current value
  });
  specimen.it("no table, no migration: the schema SQL never names Probe", async () => {
    const sql = await world.orm.schema.getCreateSchemaSQL();
    specimen.expect(sql.toLowerCase()).not.toContain("probe");
  });
  specimen.it("find matches to-ones by id whether the reference is cold or loaded", async () => {
    await world.as(user, async () => {                                        // a fresh context: load the thread first, so the to-one is LOADED
      await world.orm.em.findOne(ThreadEntity, thread.id);
      return probe.create({ user: user.id, thread: thread.id });
    });
    await world.as(user, () => probe.create({ user: user.id }));
    specimen.expect((await probe.find({ thread: thread.id })).length).toBe(1);
    specimen.expect(await probe.count({ user: user.id })).toBe(2);
  });
  specimen.it("toJSON carries metadata props only — a private handle never leaks", async () => {
    const born = await world.as(user, () => probe.create({ user: user.id, payload: { n: 1 } }));
    const wire = JSON.parse(JSON.stringify(born));
    specimen.expect(Object.keys(wire).sort()).toEqual(["createdAt", "id", "payload", "status", "updatedAt", "user"]);
  });
  specimen.it("findOne({ id }) is the instance, twice", async () => {
    const born = await world.as(user, () => probe.create({ user: user.id }));
    specimen.expect(await probe.findOne({ id: born.id })).toBe(await probe.findOne({ id: born.id }));
  });
  specimen.it("invariant: a held id is refused at create, a patch never re-keys, and every update stamps updatedAt", async () => {
    const born = await world.as(user, () => probe.create({ user: user.id }));
    await specimen.expect(world.as(user, () => probe.create({ id: born.id, user: user.id, status: "HOT" }))).rejects.toThrow(/is held/);
    specimen.expect(await probe.count()).toBe(1);
    const stamped = born.updatedAt;
    await new Promise((resolve) => setTimeout(resolve, 2));
    const patched = await world.as(user, () => probe.updateOne({ id: born.id }, { id: "forged", status: "HOT" }));
    specimen.expect(patched).toBe(born);
    specimen.expect([patched.id, patched.status]).toEqual([born.id, "HOT"]);
    specimen.expect(patched.updatedAt > stamped).toBe(true);
    specimen.expect(await probe.findOne({ id: "forged" })).toBe(null);
  });
});

specimen.describe("VirtualRepository — events through mikro's EventManager", () => {
  let twitch, seen;
  specimen.beforeAll(() => {
    twitch = new Vector(); seen = [];
    for (const op of ["create", "update", "delete"]) twitch.open(`/after/probe/${op}`, (ctx) => { seen.push([op, ctx.input.entity.id]); });
    world.datamap.subscribe(shape.subscriber(twitch));
  });
  specimen.beforeEach(() => { seen.length = 0; });

  specimen.it("create → afterCreate, updateOne → afterUpdate, removeOne → afterDelete", async () => {
    const born = await world.as(user, () => probe.create({ user: user.id }));
    await world.as(user, () => probe.updateOne({ id: born.id }, { status: "HOT" }));
    await world.as(user, () => probe.removeOne({ id: born.id }));
    specimen.expect(seen).toEqual([["create", born.id], ["update", born.id], ["delete", born.id]]);
  });
  specimen.it("a fork-minted copy's dispatch still reaches the same subscriber (fork shares the EventManager) — the wire, not the store", async () => {
    const twin = world.orm.em.fork().getRepository(ProbeEntity);
    const born = await world.as(user, () => twin.create({ user: user.id }));
    specimen.expect(seen).toEqual([["create", born.id]]);
    specimen.expect(await probe.count()).toBe(0);                            // landed in the copy's empty atom, never the held one
  });
  specimen.it("beforeDelete runs the entity's own teardown hook before the delete", async () => {
    const born = await world.as(user, () => probe.create({ user: user.id }));
    await world.as(user, () => probe.removeOne({ id: born.id }));
    specimen.expect(born.torn).toBe(true);
    specimen.expect(await probe.count()).toBe(0);
  });
  specimen.it("remove({}) tears every instance down, one delete event each", async () => {
    await world.as(user, () => probe.create({ user: user.id })); await world.as(user, () => probe.create({ user: user.id }));
    await world.as(user, () => probe.remove({}));
    specimen.expect(seen.filter(([op]) => op === "delete").length).toBe(2);
  });
});

specimen.describe("VirtualRepository — breakdown modes", () => {
  specimen.it("updateOne on a gone id throws NotFound with code NOT_FOUND", async () => {
    const born = await world.as(user, () => probe.create({ user: user.id }));
    await world.as(user, () => probe.removeOne({ id: born.id }));
    await specimen.expect(world.as(user, () => probe.updateOne({ id: born.id }, { status: "X" }))).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  specimen.it("a teardown hook that throws leaves the instance IN the store and surfaces the error", async () => {
    const born = await world.as(user, () => probe.create({ user: user.id }));
    born.teardown = () => { throw new Error("stuck"); };
    await specimen.expect(world.as(user, () => probe.removeOne({ id: born.id }))).rejects.toThrow("stuck");
    specimen.expect(await probe.findOne({ id: born.id })).toBe(born);
    delete born.teardown;                                                     // the prototype hook returns; the afterEach sweep may run
  });
  specimen.it("invariant: create never mutates the caller's data; assign never mutates the patch", async () => {
    const data = { user: user.id, payload: { n: 1 } };
    const patch = { payload: { n: 2 } };
    const born = await world.as(user, () => probe.create(data));
    await world.as(user, () => probe.updateOne({ id: born.id }, patch));
    specimen.expect(data).toEqual({ user: user.id, payload: { n: 1 } });
    specimen.expect(patch).toEqual({ payload: { n: 2 } });
  });
});
