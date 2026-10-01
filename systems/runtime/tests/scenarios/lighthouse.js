import { Url, Connection, shard, shape, Aperture } from "@vivalence/typology";
import { lighthouse } from "./fixtures.js";

export async function create() {
  const { orm, em, repos, fixtures } = await lighthouse.seed();

  const aperture = new Aperture();

  aperture
    .branch("/entities/identity")
    .graft(shard.datamap.repository(repos.identity));

  aperture
    .branch("/entities/daemon")
    .graft(shard.datamap.repository(repos.daemon));

  const handler = shape.http(aperture);
  const conn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));

  return { conn, orm, em, repos, fixtures, aperture };
}
