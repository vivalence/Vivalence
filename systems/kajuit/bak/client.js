// import { Url, Connection, RemoteRepository } from "@vivalence/typology"
// import { lighthouse as Lighthouse, entities } from "@vivalence/html/typology"
// import { env } from "$env/dynamic/public"

// export const dataspace = {
//   lighthouse: new RemoteRepository(),
//   daemon: new RemoteRepository(),
// }

// const url = new Url(env["PUBLIC_VIVA_LIGHTHOUSE_REMOTE"])
// const connection = new Connection(url)
// export const lighthouse = new Lighthouse.Lighthouse(connection)
// dataspace.lighthouse.merge(lighthouse)
// entities.lighthouse.hydrate(lighthouse)

// export default { dataspace, lighthouse }

import { steer } from "@vivalence/typology";
import { client as clientWafer } from "./client.wafer.js";
import { lighthouse as lighthouseWafer } from "@vivalence/html/typology";
import { env } from "$env/dynamic/public";

const castToIdle = steer.invoke(clientWafer, "/birth/hydrate/idle", steer.minimal);
const castLighthouse = steer.invoke(lighthouseWafer, "/verify/populate/full", steer.minimal);

const { lighthouse } = await castToIdle({
  good: {},
  variant: { lighthouseUrl: env.PUBLIC_VIVA_LIGHTHOUSE_REMOTE },
});

export { lighthouse };

let discovered = null;

export async function discover() {
  if (!lighthouse.$isAuthorized.get()) return;
  if (lighthouse.daemons.size) return;
  if (!discovered) discovered = castLighthouse({ good: lighthouse });
  return discovered;
}
