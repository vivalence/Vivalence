import { Vector } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";

export class Daemon {
  // construct
  statics = {};
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
