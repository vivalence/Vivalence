// aprende EXPOSED aperture — /assistant/wakeup/statistics
// Loads the real aprende mode into a scenario and asserts the wakeup snapshot
// aggregated from the seeded retention/trace fixtures.
import { specimen } from "@vivalence/typology";
import { mountMode } from "../scenarios/mode.js";
import { accio } from "../scenarios/registry.js";

const ROUTE = "/mode/homepage/aprende/assistant/wakeup/statistics";

specimen.describe("aprende: /assistant/wakeup/statistics", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await mountMode(await accio("@education/homepage/aprende"));
  });

  specimen.afterAll(async () => {
    await scenario.datamap.disintegrate();
  });

  specimen.it("exposes the endpoint via EXPOSED", () => {
    specimen.expect(scenario.mode.call.assistant.wakeup.statistics).toBeInstanceOf(Function);
  });

  specimen.it("returns totals from the seeded corpus", async () => {
    const stats = await scenario.conn.call(ROUTE, {});
    specimen.expect(stats.totals.literals).toBe(9); // 4 greetings + sentence + 3 forms + paradigm row
    specimen.expect(stats.totals.retentions).toBe(2);
    specimen.expect(stats.totals.traces).toBe(2);
  });

  specimen.it("buckets retention by status", async () => {
    const stats = await scenario.conn.call(ROUTE, {});
    specimen.expect(stats.retention.byStatus.KNOWN).toBe(1);
    specimen.expect(stats.retention.byStatus.LEARNING).toBe(1);
    specimen.expect(stats.retention.byStatus.UNTOUCHED).toBe(0);
    specimen.expect(stats.retention.seen).toBe(2);
    specimen.expect(stats.retention.due).toBe(1); // learning retention's nextAt is in the past
  });

  specimen.it("buckets activity by signal", async () => {
    const stats = await scenario.conn.call(ROUTE, {});
    specimen.expect(stats.activity.bySignal.SUCCESS).toBe(1);
    specimen.expect(stats.activity.bySignal.MISTAKE).toBe(1);
    specimen.expect(stats.activity.bySignal.MASTERY).toBe(0);
    specimen.expect(stats.activity.streak).toBe(1); // both traces seeded today
  });
});
