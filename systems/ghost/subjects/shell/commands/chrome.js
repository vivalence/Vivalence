import { Vector, steer } from "@vivalence/typology";
import * as skins from "../../../skins/index.js";
import * as appProcess from "../../app/index.js";
import * as clientProcess from "../../client/index.js";
import { seat } from "../lifecycle/1-population.js";
import { runtime } from "../lifecycle/2-resolution.js";

const execution = new Vector()
  .use(seat)
  .use(runtime)
  .do(async (shellDie) => {
    const client = await clientProcess.factory(shellDie);
    client.app = new appProcess.App({ client, skin: skins.chrome, controller: shellDie.controller.branch("app") });
    await steer.dispatch.execute(appProcess.lifecycle.execution, client.app);
    if (client.controller.status.is("FAILED")) throw client.controller.status.reflection.error;
    if (client.app.controller.status.is("FAILED")) throw client.app.controller.status.reflection.error;
  });

export const chrome = new Vector().open(
  { nature: "/chrome", valence: "the repl under the chrome — the dock paints. Example: viva chrome" },
  (shellDie) => steer.dispatch.execute(execution, shellDie),
);
