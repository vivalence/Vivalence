import { specimen } from "@vivalence/typology";
import { create } from "../scenarios/daemon.js";

specimen.describe("mode entities (direct)", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("intent entity boots and seeds", () => {
    specimen.expect(scenario.fixtures.intent).toBeTruthy();
    specimen.expect(scenario.fixtures.intent.slug).toBe("survival-flashcard");
    specimen.expect(scenario.fixtures.intent.type).toBe("SELFEVIDENT");
  });

  specimen.it("intent has traits and data", () => {
    specimen.expect(scenario.fixtures.intent.traits).toEqual(["FURNISHED"]);
    specimen.expect(scenario.fixtures.intent.trait.FURNISHED.recall).toBe("LEARNING");
  });

  specimen.it("session has mode", () => {
    specimen.expect(scenario.fixtures.session.mode).toBeTruthy();
  });

  specimen.it("session has intent", () => {
    specimen.expect(scenario.fixtures.session.intent).toBeTruthy();
  });

  specimen.it("mode entity has new traits", () => {
    const traits = scenario.fixtures.mode.traits;
    specimen.expect(traits).toContain("BUFFERED");
    specimen.expect(traits).toContain("SELFEVIDENT");
    specimen.expect(traits).toContain("INTENTED");
    specimen.expect(traits).toContain("EMITTER");
  });
});
