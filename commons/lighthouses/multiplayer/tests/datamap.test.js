import { specimen } from "@vivalence/typology";
import { lighthouse } from "@vivalence/runtime/scenarios";

specimen.describe("lighthouse datamap (scenario)", () => {
  let scenario;
  let finn;
  let member;

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
    finn = await scenario.signup("finn");
    await scenario.conn.call("/auth/enroll", { access: finn.access, daemon: "test-language" });
    member = scenario.connect(finn.access);
  });

  specimen.afterAll(async () => {
    await scenario.close();
  });

  specimen.describe("daemon entity", () => {
    specimen.it("find daemons", async () => {
      const result = await member.call("/entities/daemon/find", {
        where: {},
      });
      specimen.expect(Array.isArray(result)).toBe(true);
      specimen.expect(result.length).toBe(1);
      specimen.expect(result[0].slug).toBe("test-language");
    });

    specimen.it("findOne daemon by slug", async () => {
      const result = await member.call("/entities/daemon/findOne", {
        where: { slug: "test-language" },
      });
      specimen.expect(result.slug).toBe("test-language");
      specimen.expect(result.remote).toBe(
        "http://localhost:5173/daemon/test-language",
      );
    });

    specimen.it("announce daemon", async () => {
      const result = await scenario.conn.call("/daemons/announce", {
        slug: "test-language-2",
        remote: "http://localhost:5174/daemon/test-language-2",
      });
      specimen.expect(result.slug).toBe("test-language-2");
      specimen.expect(result.id).toBeTruthy();
    });

    specimen.it("reannounce moves the remote", async () => {
      const result = await scenario.conn.call("/daemons/announce", {
        slug: "test-language-2",
        remote: "http://localhost:5175/daemon/test-language-2",
      });
      specimen.expect(result.remote).toBe(
        "http://localhost:5175/daemon/test-language-2",
      );
    });

    specimen.it("findOne nonexistent returns null", async () => {
      const result = await member.call("/entities/daemon/findOne", {
        where: { slug: "nonexistent" },
      });
      specimen.expect(result).toBeNull();
    });

    specimen.it("announce creates when absent", async () => {
      const result = await scenario.conn.call("/daemons/announce", { slug: "new-daemon", remote: "http://localhost:9000" });
      specimen.expect(result.slug).toBe("new-daemon");
      specimen.expect(result.remote).toBe("http://localhost:9000");
      specimen.expect(result.id).toBeTruthy();
    });

    specimen.it("announce updates when present", async () => {
      const result = await scenario.conn.call("/daemons/announce", { slug: "new-daemon", remote: "http://localhost:9001" });
      specimen.expect(result.slug).toBe("new-daemon");
      specimen.expect(result.remote).toBe("http://localhost:9001");
    });
  });

  specimen.describe("identity card", () => {
    specimen.it("verify reads the card, never the authentication embed", async () => {
      const result = await scenario.conn.call("/auth/verify", { access: finn.access });
      specimen.expect(result.identity.slug).toBe("finn");
      specimen.expect(result.identity.authentication).toBeUndefined();
    });
  });
});
