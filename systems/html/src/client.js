import { atom, effect, computed, map } from "nanostores";
import { env } from "$env/dynamic/public";

import { Url, Connection, RemoteRepository } from "@vivalence/typology";
import { lighthouse as Lighthouse, entities } from "@vivalence/html/typology";

export const dataspace = {
  lighthouse: new RemoteRepository(),
  daemon: new RemoteRepository(),
};

const url = new Url(env["PUBLIC_VIVA_LIGHTHOUSE_REMOTE"]);
const connection = new Connection(url);
export const lighthouse = new Lighthouse.Lighthouse(connection);
dataspace.lighthouse.merge(lighthouse);

export default { dataspace, lighthouse };

// DEBUG: expose for chrome dev tools inspection — remove after dev
window.__viva = { dataspace, lighthouse };
