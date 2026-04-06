import { Connection, Url, steer } from "@vivalence/typology";
import { Lighthouse } from "./lighthouse/lighthouse.js";
import { hydrate } from "./lighthouse/persistence.js";
import { lighthouse as lighthouseWafer } from "./lighthouse/lighthouse.wafer.js";
import { env } from "$env/dynamic/public";

const url = new Url(env.PUBLIC_VIVA_LIGHTHOUSE_REMOTE);
const connection = new Connection(url);
export const lighthouse = new Lighthouse(connection);
hydrate(lighthouse);

const castDiscover = steer.invoke(lighthouseWafer, "/verify/populate/full", steer.direct);
let discovered = null;

export async function discover() {
  if (!lighthouse.$isAuthorized.get()) return;
  if (lighthouse.daemons.size) return;
  if (!discovered) discovered = castDiscover({ good: lighthouse });
  return discovered;
}
