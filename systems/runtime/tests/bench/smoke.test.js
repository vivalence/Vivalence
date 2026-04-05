import { specimen } from "@vivalence/typology";
import { bench } from "../scenarios/bench.js";

// ── raw import smoke test ──────────────────────────────────────────
import * as domain from "../../../../registry/kernels/@vivalence/domain/learning/domain.viva.js";
import * as flashcard from "../../../../registry/modes/@vivalence/game/flashcard/flashcard.viva.js";
import * as judge from "../../../../registry/modes/@vivalence/game/judge/judge.viva.js";

specimen.describe("bench (raw imports)", { sanitizeOps: false, sanitizeResources: false }, () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await bench({
      kernel: [domain],
      modes: [flashcard, judge],
    });
  });

  specimen.afterAll(async () => {
    await scenario?.teardown();
  });

  specimen.it("daemon boots with modes", () => {
    specimen.expect(scenario.daemon.modes.game.flashcard).toBeTruthy();
    specimen.expect(scenario.daemon.modes.game.judge).toBeTruthy();
  });

  specimen.it("entities have domain repositories", () => {
    const literalRepo = scenario.daemon.entities.literal;
    specimen.expect(typeof literalRepo.feed).toBe("function");
    specimen.expect(typeof literalRepo.novel).toBe("function");
    specimen.expect(typeof literalRepo.due).toBe("function");
  });

  specimen.it("modes have emit objects", () => {
    specimen.expect(scenario.daemon.modes.game.flashcard.emit).toBeTruthy();
    specimen.expect(scenario.daemon.modes.game.judge.emit).toBeTruthy();
  });

  specimen.it("connection routes work", async () => {
    const result = await scenario.connection.call("/entities/literal/find", {
      where: {},
      options: { limit: 10 },
    });
    specimen.expect(Array.isArray(result)).toBe(true);
  });
});

// ── paladin specifier smoke test ───────────────────────────────────
specimen.describe("bench (paladin specifiers)", { sanitizeOps: false, sanitizeResources: false }, () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await bench({
      kernel: [
        "@vivalence/domain/language-learning",
        "@vivalence/ontology/word",
        "@vivalence/ontology/sentence",
      ],
      modes: [
        "@vivalence/game/flashcard",
        "@vivalence/game/judge",
        "@vivalence/game/pick",
        "@vivalence/game/exhibit",
      ],
    });
  });

  specimen.afterAll(async () => {
    await scenario?.teardown();
  });

  specimen.it("daemon boots with 4 modes", () => {
    specimen.expect(scenario.daemon.modes.game.flashcard).toBeTruthy();
    specimen.expect(scenario.daemon.modes.game.judge).toBeTruthy();
    specimen.expect(scenario.daemon.modes.game.pick).toBeTruthy();
    specimen.expect(scenario.daemon.modes.game.exhibit).toBeTruthy();
  });

  specimen.it("ontology entities seeded", async () => {
    const symbols = await scenario.daemon.entities.symbol.find({});
    specimen.expect(symbols.length).toBeGreaterThan(0);
  });

  specimen.it("literal.feed works with domain repo", async () => {
    const result = await scenario.daemon.entities.literal.feed({}, { limit: 5 });
    specimen.expect(Array.isArray(result)).toBe(true);
  });
});
