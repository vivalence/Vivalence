import { specimen } from "@vivalence/typology";
import { seed } from "../scenarios/fixtures.js";
import { accio } from "../scenarios/registry.js";

specimen.describe("multiplayer provider — enroll", () => {
  let orm, users, authority;

  specimen.beforeAll(async () => {
    const seeded = await seed();
    orm = seeded.orm;
    users = seeded.entities.user;
    const { provider } = await accio("@commons/lighthouse/multiplayer");
    authority = await provider({ statics: { remote: null } }, users, async (token) => ({
      status: "SUCCESS",
      identity: { id: token },
    }));
  });

  specimen.afterAll(async () => {
    await orm.close();
  });

  specimen.it("getUser reads, never makes", async () => {
    const identity = await authority.authenticate("reader-only");
    specimen.expect(await identity.getUser()).toBe(null);
    specimen.expect(await users.count({ id: "reader-only" })).toBe(0);
  });

  specimen.it("forty parallel enrolls of one fresh identity land one row", async () => {
    const identity = await authority.authenticate("enroll-race");
    const settled = await Promise.all(Array.from({ length: 40 }, () => identity.enroll()));
    specimen.expect(settled.every((user) => user?.id === "enroll-race")).toBe(true);
    specimen.expect(await users.count({ id: "enroll-race" })).toBe(1);
    specimen.expect((await identity.getUser()).id).toBe("enroll-race");
  });

  specimen.it("enroll never overwrites an existing user's roles", async () => {
    const identity = await authority.authenticate("enroll-admin");
    await identity.enroll();
    await users.nativeUpdate({ id: "enroll-admin" }, { roles: ["ADMIN"] });
    await identity.enroll();
    const user = await users.findOne({ id: "enroll-admin" }, { refresh: true });
    specimen.expect(user.roles).toEqual(["ADMIN"]);
  });
});
