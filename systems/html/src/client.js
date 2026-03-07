import { atom, effect, computed, map } from "nanostores";
import { env } from "$env/dynamic/public";

import { Url, Connection } from "@vivalence/typology";
import { lighthouse as Lighthouse, Repository, entities } from "@vivalence/html/typology";

export const dataspace = {
  lighthouse: new Repository(entities.lighthouse),
  daemon: new Repository(entities.daemon),
};

const url = new Url(env["PUBLIC_VIVA_LIGHTHOUSE_REMOTE"]);
const connection = new Connection(url);
export const lighthouse = new Lighthouse.Lighthouse(connection);
dataspace.lighthouse.add(lighthouse);

export default { dataspace, lighthouse };
