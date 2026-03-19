import { specimen } from "@vivalence/typology";
import { create } from "./daemon.js";

specimen.describe("daemon routes (scenario)", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.describe("freight", () => {
    specimen.it("returns cargo", async () => {
      const result = await scenario.conn.call("/cargo");
      specimen.expect(result.test).toBe(true);
      specimen.expect(result.version).toBe("0.0.1");
    });
  });

  specimen.describe("datamap", () => {
    specimen.it("find literals", async () => {
      const result = await scenario.conn.call("/entities/literal/find", {
        where: {},
        options: { limit: 10 },
      });
      specimen.expect(result.length).toBe(2);
    });

    specimen.it("findOne literal by slug", async () => {
      const result = await scenario.conn.call("/entities/literal/findOne", {
        where: { slug: "hello" },
      });
      specimen.expect(result.slug).toBe("hello");
      specimen.expect(result.data.TRANSLATED.learning).toBe("olá");
    });

    specimen.it("find symbols", async () => {
      const result = await scenario.conn.call("/entities/symbol/find", {
        where: {},
      });
      specimen.expect(result.length).toBe(1);
      specimen.expect(result[0].slug).toBe("greeting");
    });
  });

  specimen.describe("modes", () => {
    specimen.it("findOne mode by slug", async () => {
      const result = await scenario.conn.call("/modes/game/findOne", {
        where: { slug: "flashcard" },
      });
      specimen.expect(result.manifest.slug).toBe("flashcard");
    });

    specimen.it("TERMINAL mode includes view url", async () => {
      const result = await scenario.conn.call("/modes/game/findOne", {
        where: { slug: "flashcard" },
      });
      specimen.expect(result.view.url).toBeTruthy();
    });
  });

  specimen.describe("userspace", () => {
    specimen.it("handshake requires auth", async () => {
      const response = await scenario.conn.fetch("/userspace/handshake");
      specimen.expect(response.status).toBe(401);
    });

    specimen.it("entities require auth", async () => {
      const response = await scenario.conn.fetch("/userspace/entities/session/find", {});
      specimen.expect(response.status).toBe(401);
    });
  });
});
