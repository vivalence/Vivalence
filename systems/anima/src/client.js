import paladin, { factories } from "@vivalence/paladin";
import { trace, Controller, Span, Vector, steer } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";
import { chrome } from "./surfaces/index.js";

const instance = await factories.instance(paladin.instance); // @beef still dont like this.
await paladin.ledger.registry.supply();

const die = {
  controller: new Controller({ stdout: new Span("anima") }),
  instance,
  mask: instance.clients.find((client) => client.manifest.slug === "anima"),
};
die.register = await paladin.ledger.registry.wire(die.mask);

globalThis.addEventListener("pagehide", () => die.controller.kill("SIGTERM", "pagehide"));

const logging = async (appDie, next) => {
  const shown = (record) => {
    const SHOWN = ["log", "fault"];
    if (!SHOWN.includes(record.track)) return;
    globalThis.console[record.track === "fault" ? "error" : "log"](
      trace.pathname(record.path),
      record.track,
      record.data,
    );
  };

  for (const record of appDie.client.controller.stdout.history) shown(record);
  const untap = appDie.client.controller.stdout.pipe.tap(shown);
  try {
    await next();
  } finally {
    untap();
  }
};

try {
  const client = await ghost.client.factory(die);

  client.app = new ghost.app.App({
    // @beef maybe move app onto client die? not sure.
    client,
    surface: chrome,
    controller: die.controller.branch("app"),
  });

  await steer.dispatch.execute(
    new Vector()
      .graft(ghost.app.lifecycle.execution) //
      .use(logging),
    client.app,
  );
} catch (error) {
  die.controller.fault(error);
}
