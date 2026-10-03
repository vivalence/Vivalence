// systems/runtime/tests/daemon/enroll.test.js:1
import { Status, specimen } from "@vivalence/typology";
import { seed } from "../scenarios/fixtures.js";
import { accio } from "../scenarios/registry.js";
import { lighthouse } from "../scenarios/index.js";

specimen.describe("multiplayer provider — enroll", () => {
  let orm, users, authority, beacon;

  specimen.beforeAll(async () => {
    const seeded = await seed();
    orm = seeded.orm;
    users = seeded.entities.user;
    beacon = await lighthouse.create();
    const { provider } = await accio("@commons/lighthouse/multiplayer");
    authority = provider({ statics: {} }, { users, connection: beacon.conn, status: new Status("RUNNING"), daemon: "enroll-daemon", remote: "http://localhost:2501" });
    await authority.announced;
  });

  specimen.afterAll(async () => {
    await orm.close();
    await beacon.close();
  });

  specimen.it("getUser reads, never makes", async () => {
    const reader = await beacon.signup("reader-only");
    const identity = await authority.authenticate(reader.access);
    specimen.expect(await identity.getUser()).toBe(null);
    specimen.expect(await users.count({ id: reader.identity.id })).toBe(0);
  });

  specimen.it("forty parallel enrolls of one fresh identity land one row", async () => {
    const racer = await beacon.signup("enroll-race");
    const identity = await authority.authenticate(racer.access);
    const settled = await Promise.all(Array.from({ length: 40 }, () => identity.enroll()));
    specimen.expect(settled.every((user) => user?.id === racer.identity.id)).toBe(true);
    specimen.expect(await users.count({ id: racer.identity.id })).toBe(1);
    specimen.expect((await identity.getUser()).id).toBe(racer.identity.id);
  });

  specimen.it("enroll never overwrites an existing user's roles", async () => {
    const admin = await beacon.signup("enroll-admin");
    const identity = await authority.authenticate(admin.access);
    await identity.enroll();
    await users.nativeUpdate({ id: admin.identity.id }, { roles: ["ADMIN"] });
    await identity.enroll();
    const user = await users.findOne({ id: admin.identity.id }, { refresh: true });
    specimen.expect(user.roles).toEqual(["ADMIN"]);
  });
});
