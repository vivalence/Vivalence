import { Aperture, Cargo, Twitch } from "@vivalence/typology";

export class Runtime {
  type = "runtime";
  manifest = null;
  slug = null;
  reference = null;
  url = null;
  attach = null;
  mountpoint = null;
  call = null;
  statics = null;
  cargo = new Cargo();
  controller = null;
  instance = null;
  register = null;
  datamap = null;
  entities = {};
  minted = {};
  cortex = null;
  lighthouse = null;
  processes = {};
  modes = {};
  services = {};
  domain = null;
  aperture = new Aperture();
  twitch = new Twitch();

  constructor(fields) {
    Object.assign(this, fields);
  }

}
