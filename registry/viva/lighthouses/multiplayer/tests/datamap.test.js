import { specimen } from "@vivalence/typology";
import { lighthouse } from "@vivalence/runtime/scenarios";

specimen.describe("lighthouse datamap (scenario)", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.describe("daemon entity", () => {
    specimen.it("find daemons", async () => {
      const result = await scenario.conn.call("/entities/daemon/find", {
        where: {},
      });
      specimen.expect(Array.isArray(result)).toBe(true);
      specimen.expect(result.length).toBe(1);
      specimen.expect(result[0].slug).toBe("test-language");
    });

    specimen.it("findOne daemon by slug", async () => {
      const result = await scenario.conn.call("/entities/daemon/findOne", {
        where: { slug: "test-language" },
      });
      specimen.expect(result.slug).toBe("test-language");
      specimen.expect(result.url).toBe("http://localhost:5173/daemon/test-language");
    });

    specimen.it("create daemon", async () => {
      const result = await scenario.conn.call("/entities/daemon/create", {
        data: { slug: "test-language-2", url: "http://localhost:5174/daemon/test-language-2" },
      });
      specimen.expect(result.slug).toBe("test-language-2");
      specimen.expect(result.id).toBeTruthy();
    });

    specimen.it("update daemon", async () => {
      const result = await scenario.conn.call("/entities/daemon/updateOne", {
        where: { slug: "test-language-2" },
        data: { url: "http://localhost:5175/daemon/test-language-2" },
      });
      specimen.expect(result.url).toBe("http://localhost:5175/daemon/test-language-2");
    });

    specimen.it("remove daemon", async () => {
      const result = await scenario.conn.call("/entities/daemon/removeOne", {
        where: { slug: "test-language-2" },
      });
      specimen.expect(result.ok).toBe(true);
    });

    specimen.it("findOne nonexistent returns null", async () => {
      const result = await scenario.conn.call("/entities/daemon/findOne", {
        where: { slug: "nonexistent" },
      });
      specimen.expect(result).toBeNull();
    });

    specimen.it("ensure creates when absent", async () => {
      const result = await scenario.conn.call("/entities/daemon/ensure", {
        data: { slug: "new-daemon", url: "http://localhost:9000" },
      });
      specimen.expect(result.slug).toBe("new-daemon");
      specimen.expect(result.url).toBe("http://localhost:9000");
      specimen.expect(result.id).toBeTruthy();
    });

    specimen.it("ensure updates when present", async () => {
      const result = await scenario.conn.call("/entities/daemon/ensure", {
        data: { slug: "new-daemon", url: "http://localhost:9001" },
      });
      specimen.expect(result.slug).toBe("new-daemon");
      specimen.expect(result.url).toBe("http://localhost:9001");
    });

    specimen.it("ensure cleanup", async () => {
      await scenario.conn.call("/entities/daemon/removeOne", {
        where: { slug: "new-daemon" },
      });
      const result = await scenario.conn.call("/entities/daemon/findOne", {
        where: { slug: "new-daemon" },
      });
      specimen.expect(result).toBeNull();
    });
  });

  specimen.describe("identity entity", () => {
    specimen.it("find identities", async () => {
      const result = await scenario.conn.call("/entities/identity/find", {
        where: {},
      });
      specimen.expect(Array.isArray(result)).toBe(true);
      specimen.expect(result.length).toBe(1);
      specimen.expect(result[0].slug).toBe("beef");
    });

    specimen.it("findOne identity by slug", async () => {
      const result = await scenario.conn.call("/entities/identity/findOne", {
        where: { slug: "beef" },
      });
      specimen.expect(result.slug).toBe("beef");
      specimen.expect(result.authentication.provider).toBe("password");
    });

    specimen.it("findOne nonexistent identity returns null", async () => {
      const result = await scenario.conn.call("/entities/identity/findOne", {
        where: { slug: "ghost" },
      });
      specimen.expect(result).toBe(null);
    });
  });
});
