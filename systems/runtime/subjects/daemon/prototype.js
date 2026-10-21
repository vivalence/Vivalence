import { Aperture, contexts, shard } from "@vivalence/typology";

export class Daemon {
  type = "daemon";
  aperture = new Aperture().use(shard.context.spread(contexts.host, this));
  slug = null;
  mask = null;
  controller = null;
  connection = null;
  call = null;
  entity = null;
  statics = null;
  mountpoint = null;
  cortex = null;
  datamap = null;
  domain = null;
  entities = {};
  twitch = null;
  minted = {};
  modes = {};
  providers = {};

  constructor(fields) {
    Object.assign(this, fields);
  }

  get manifest() {
    return this.mask.manifest;
  }

  get reference() {
    return this.mask.reference;
  }

  get url() {
    return this.mask.url;
  }

  get attach() {
    return this.mask.attach;
  }

  get traits() {
    return this.manifest.traits || [];
  }

  get $status() {
    return this.controller.status.$transient;
  }
}
