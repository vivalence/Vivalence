import { Aperture, Cargo, Cortex, Vector, shard } from "@vivalence/typology";
import { VirtualSchema } from "@vivalence/typology/entities";
import { ProcessEntity, ProcessRepository, ProcessSchema } from "../entities/index.ts";

export class Daemon extends ProcessEntity {
  type = "daemon";
  aperture = new Aperture().use(shard.context.bind("daemon", this));
  connection = null;
  call = null;
  authority = null;
  lighthouse = null;
  harness = null;
  entity = null;
  statics = null;
  mountpoint = null;
  cargo = new Cargo();
  cortex = new Cortex();
  datamap = null;
  domain = null;
  entities = {};
  twitch = new Vector();
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

  flatmodes() {
    return Object.values(this.modes).flatMap((type) => Object.values(type));
  }
}

export const DaemonSchema = new VirtualSchema({ class: Daemon, extends: ProcessSchema, repository: () => ProcessRepository, properties: {} });
