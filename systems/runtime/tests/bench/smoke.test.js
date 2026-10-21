import { specimen } from "@vivalence/typology";
import { accio } from "../scenarios/registry.js";
import { bench } from "../scenarios/bench.js";

// ── raw import smoke test ──────────────────────────────────────────

specimen.describe("bench (raw imports)", { sanitizeOps: false, sanitizeResources: false }, () => {
  let scenario;

  specimen.beforeAll(async () => {
    const modes = await Promise.all([
      accio("@memo/domain/srs"),
      accio("@memo/srs/memo"),
    ]);
    scenario = await bench({ modes });
  });

  specimen.afterAll(async () => {
    await scenario?.teardown();
  });

  specimen.it("daemon boots with modes", () => {
    specimen.expect(scenario.daemon.modes.srs.memo).toBeTruthy();
  });

  specimen.it("entities have domain repositories", () => {
    const literalRepo = scenario.daemon.entities.literal;
    specimen.expect(typeof literalRepo.feed).toBe("function");
    specimen.expect(typeof literalRepo.novel).toBe("function");
    specimen.expect(typeof literalRepo.due).toBe("function");
  });

  specimen.it("modes have emit objects", () => {
    specimen.expect(scenario.daemon.modes.srs.memo.emit).toBeTruthy();
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
      modes: [
        "@memo/domain/srs",
        "@memo/topography/latin",
        "@memo/srs/memo",
      ],
    });
  });

  specimen.afterAll(async () => {
    await scenario?.teardown();
  });

  specimen.it("daemon boots with its mode", () => {
    specimen.expect(scenario.daemon.modes.srs.memo).toBeTruthy();
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
