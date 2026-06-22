// aprende EXPOSED aperture — /assistant/wakeup/statistics
// Loads the real aprende mode into a scenario and asserts the wakeup snapshot
// aggregated from the seeded memory/trace fixtures.
import { specimen } from "@vivalence/typology";
import { mountMode } from "../scenarios/mode.js";
import * as aprende from "../../../../registry/modes/@vivalence/homepage/aprende/aprende.viva.js";

const ROUTE = "/mode/homepage/aprende/assistant/wakeup/statistics";

specimen.describe("aprende: /assistant/wakeup/statistics", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await mountMode(aprende);
  });

  specimen.afterAll(async () => {
    await scenario.datamap.disintegrate();
  });

  specimen.it("exposes the endpoint via EXPOSED", () => {
    specimen.expect(scenario.mode.call.assistant.wakeup.statistics).toBeInstanceOf(Function);
  });

  specimen.it("returns totals from the seeded corpus", async () => {
    const stats = await scenario.conn.call(ROUTE, {});
    specimen.expect(stats.totals.literals).toBe(4); // hello, goodbye, thanks, please
    specimen.expect(stats.totals.memories).toBe(2);
    specimen.expect(stats.totals.traces).toBe(2);
  });

  specimen.it("buckets memory by status", async () => {
    const stats = await scenario.conn.call(ROUTE, {});
    specimen.expect(stats.memory.byStatus.KNOWN).toBe(1);
    specimen.expect(stats.memory.byStatus.LEARNING).toBe(1);
    specimen.expect(stats.memory.byStatus.UNTOUCHED).toBe(0);
    specimen.expect(stats.memory.seen).toBe(2);
    specimen.expect(stats.memory.due).toBe(1); // learning memory's nextAt is in the past
  });

  specimen.it("buckets activity by signal", async () => {
    const stats = await scenario.conn.call(ROUTE, {});
    specimen.expect(stats.activity.bySignal.SUCCESS).toBe(1);
    specimen.expect(stats.activity.bySignal.MISTAKE).toBe(1);
    specimen.expect(stats.activity.bySignal.MASTERY).toBe(0);
    specimen.expect(stats.activity.streak).toBe(1); // both traces seeded today
  });
});
