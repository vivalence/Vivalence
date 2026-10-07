import { Aperture, Cargo, contexts, shard } from "@vivalence/typology";
import { VirtualSchema } from "@vivalence/typology/entities";
import { ProcessEntity, ProcessRepository, ProcessSchema } from "../entities/index.ts";

export class Daemon extends ProcessEntity {
  type = "daemon";
  aperture = new Aperture().use(shard.context.spread(contexts.host, this));
  connection = null;
  call = null;
  entity = null;
  statics = null;
  mountpoint = null;
  cargo = new Cargo();
  cortex = null;
  datamap = null;
  domain = null;
  entities = {};
  twitch = null;
  minted = {};
  modes = {};
  services = {};

  get url() {
    return this.mask.url;
  }

  get attach() {
    return this.mask.attach;
  }

  get traits() {
    return this.manifest.traits || [];
  }

}

export const DaemonSchema = new VirtualSchema({ class: Daemon, extends: ProcessSchema, repository: () => ProcessRepository, properties: {} });
