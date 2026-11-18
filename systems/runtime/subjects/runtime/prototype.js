import { Aperture, Twitch, Vector } from "@vivalence/typology";

export class Runtime {
  type = "runtime";
  mask = null;
  mountpoint = null;
  call = null;
  statics = null;
  controller = null;
  datamap = null;
  entities = {};
  minted = {};
  cortex = null;
  lighthouse = null;
  daemons = {};
  modes = {};
  services = {};
  domain = null;
  aperture = new Aperture();
  twitch = new Twitch();
  attachment = new Vector();

  constructor(fields) {
    Object.assign(this, fields);
  }

  get manifest() {
    return this.mask.manifest;
  }

  get slug() {
    return this.mask.manifest.slug;
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
}
