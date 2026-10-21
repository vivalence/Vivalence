import { Vector, steer } from "@vivalence/typology";
import * as surfaces from "../../../surfaces/index.js";
import * as appProcess from "../../app/index.js";
import * as clientProcess from "../../client/index.js";
import { boot } from "../lifecycle/boot.js";
import { ledger } from "../lifecycle/ledger.js";
import { seat } from "../lifecycle/seat.js";

const execution = new Vector()
  .use(seat)
  .use(ledger)
  .use(boot)
  .do(async (shellDie) => {
    const client = await clientProcess.factory(shellDie);
    client.app = new appProcess.App({ client, surface: surfaces.chrome, controller: shellDie.controller.branch("app") });
    await steer.dispatch.execute(appProcess.lifecycle.execution, client.app);
    if (client.controller.status.is("FAILED")) throw client.controller.status.reflection.error;
    if (client.app.controller.status.is("FAILED")) throw client.app.controller.status.reflection.error;
  });

export const chrome = new Vector().open(
  { nature: "/chrome", valence: "the repl under the chrome — the dock paints. Example: viva chrome" },
  (shellDie) => steer.dispatch.execute(execution, shellDie),
);
