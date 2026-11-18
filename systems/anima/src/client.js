import paladin, { factories } from "@vivalence/paladin";
import { Connection, Controller, Span, Vector, control, sleep, steer } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";
import { chrome } from "./surfaces/index.js";

const instance = await factories.instance(paladin); // @beef still dont like this.
await paladin.ledger.registry.supply();

const die = {
  controller: paladin.control(new Controller({ stdout: new Span("anima") })),
  instance,
  mask: instance.client("anima"),
};
die.register = await paladin.ledger.registry.wire(die.mask);

const reported = async (appDie, next) => {
  try {
    await next();
  } catch (error) {
    appDie.client.controller.stdout.fault(error);
    await control.hold(appDie.controller);
  }
};

const reach = async (appDie, next) => {
  const remote = appDie.client.runtime.remote;
  for (let attempt = 1; ; attempt++) {
    appDie.client.controller.stdout.log({ reaching: remote.absolute, attempt });
    const status = await new Connection(remote).call("/beacon/status").then(
      (held) => held,
      () => null,
    );
    if (status !== null && status.code === "RUNNING") return next();
    if (status !== null && status.code !== "IDLE")
      throw new Error(`runtime ${remote.absolute} is ${status.code}`);
    await sleep.ms(1000);
  }
};

const connect = async (appDie, next) => {
  await ghost.client.ready(appDie.client);
  await next();
};

try {
  const client = await ghost.client.minted(die);

  client.app = new ghost.app.App({
    // @beef maybe move app onto client die? not sure.
    client,
    surface: chrome,
    controller: die.controller.branch("app"),
  });

  await steer.dispatch.execute(
    new Vector()
      .graft(ghost.app.lifecycle.execution) //
      .use(reported)
      .use(reach)
      .use(connect),
    client.app,
  );
} catch (error) {
  die.controller.fault(error);
}
