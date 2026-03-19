import { specimen } from "@vivalence/typology";
import { create } from "@vivalence/runtime/tests/scenario";

specimen.describe("client ↔ runtime (scenario)", () => {
  let scenario, conn;

  specimen.beforeAll(async () => {
    scenario = await create();
    conn = scenario.conn;
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.describe("daemon hydration", () => {
    specimen.it("hydrates modes from runtime", async () => {
      const result = await conn.call("/modes/game/findOne", {
        where: { slug: "flashcard" },
      });
      specimen.expect(result.manifest.slug).toBe("flashcard");
    });

    specimen.it("hydrates literals through datamap", async () => {
      const result = await conn.call("/entities/literal/find", {
        where: {},
        options: { limit: 10 },
      });
      specimen.expect(result.length).toBe(2);
    });

    specimen.it("hydrates symbols through datamap", async () => {
      const result = await conn.call("/entities/symbol/find", {
        where: {},
      });
      specimen.expect(result.length).toBe(1);
      specimen.expect(result[0].slug).toBe("greeting");
    });
  });
});
