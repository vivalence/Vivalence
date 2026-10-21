import { specimen } from "@vivalence/typology";
import { bench } from "../scenarios/bench.js";

const emitted = (result) => result?.output?.buffer ?? [];

specimen.describe("srs/memo", { sanitizeOps: false, sanitizeResources: false }, () => {
  let scenario;
  let thread;

  specimen.beforeAll(async () => {
    scenario = await bench({
      modes: ["@memo/domain/srs", "@memo/topography/latin", "@memo/srs/memo"],
      statics: { language: { known: "English", learning: "Latin" } },
    });
    thread = scenario.daemon.entities.thread.create({ user: scenario.user, mode: scenario.daemon.modes.srs.memo.id });
    await scenario.em.flush();
  });

  specimen.afterAll(async () => {
    await scenario?.teardown();
  });

  specimen.it("mode wired with emit object", () => {
    specimen.expect(Object.keys(scenario.daemon.modes.srs.memo.emit)).toEqual(["session"]);
  });

  specimen.it("emit.session returns buffer(s)", async () => {
    const result = await scenario.daemon.modes.srs.memo.emit.session({ thread: thread.id, limit: 2 });
    specimen.expect(result.condition).toBeTruthy();
    for (const buffer of emitted(result)) specimen.expect(buffer.data).toBeTruthy();
  });
});
