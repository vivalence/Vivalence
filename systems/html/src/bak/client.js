import { Url, Connection, RemoteRepository } from "@vivalence/typology"
import { lighthouse as Lighthouse, entities } from "@vivalence/html/typology"
import { env } from "$env/dynamic/public"

export const dataspace = {
  lighthouse: new RemoteRepository(),
  daemon: new RemoteRepository(),
}

const url = new Url(env["PUBLIC_VIVA_LIGHTHOUSE_REMOTE"])
const connection = new Connection(url)
export const lighthouse = new Lighthouse.Lighthouse(connection)
dataspace.lighthouse.merge(lighthouse)
entities.lighthouse.hydrate(lighthouse)

export default { dataspace, lighthouse }
