import registry from "@vivalence/registry";
import { Vector } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";

export class Daemon {
  constructor(config) {
    this.config = config;
  }
  // construct
  registry = registry;
  config = null;
  aperture = new Aperture().open("/status", async () => ({ success: true }));
  twitch = new Vector();
  // preflight
  process = null;

  // populate

  // resolve
  // services = new Set(); // {...service map entry}[]
  runtimes = new Set(); // { slug instance config services status prototype }[]

  // integrate
  server = null;
}
