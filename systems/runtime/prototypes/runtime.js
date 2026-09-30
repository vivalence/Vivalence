import { Aperture, Vector } from "@vivalence/typology";

export class Runtime {
  instance = null;
  datamap = null;
  processes = {};
  aperture = new Aperture();
  twitch = new Vector();

  constructor(fields) {
    Object.assign(this, fields);
  }
}
