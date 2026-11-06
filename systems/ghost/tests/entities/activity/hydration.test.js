import { Controller, Vector, specimen, steer } from "@vivalence/typology";
import { hydration } from "../../../entities/activity/hydration.js";

const hydrate = (die) => steer.dispatch.execute(new Vector().graft(hydration).do(async () => {}), die);

const world = () => {
  const calls = [];
  const connection = {
    branch: (path) => ({ call: async (route, input) => calls.push([path + route, input]) }),
  };
  const entity = { id: "activity-1", controller: new Controller() };
  return { calls, die: { entity, runtime: { connection } } };
};

specimen.describe("activity hydration", () => {
  specimen.it("an activity hydrated twice, then signalled, calls the runtime once", async () => {
    const { calls, die } = world();
    await hydrate(die);
    await hydrate(die);
    await die.entity.controller.kill("SIGSTOP", "hold");
    specimen.expect(calls).toEqual([["/userspace/entities/activity/activity-1/stdin/SIGSTOP", { reason: "hold" }]]);
  });

  specimen.it("the second hydration's effect is the one that answers", async () => {
    const { calls, die } = world();
    await hydrate(die);
    die.entity.id = "activity-2";
    await hydrate(die);
    await die.entity.controller.kill("SIGKILL", "cut");
    specimen.expect(calls).toEqual([["/userspace/entities/activity/activity-2/stdin/SIGKILL", { reason: "cut" }]]);
  });
});
