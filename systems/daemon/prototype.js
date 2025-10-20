import { Vector } from "@vivalence/vector"; //
import { Path, Url } from "@vivalence/typology";
import { Aperture } from "@vivalence/vector/aperture";

export class Daemon {
  statics = {};
  process = null;
  server = null;
  aperture = new Aperture().open("/status", async () => ({ success: true }));
  twitch = new Vector();

  services = []; // dies {...service map entry}[]
  runtimes = []; // dies { slug instance config services status prototype }[]

  // runtime={[slug]: instance} ; // instance
  // service={[slug]: instance} ; // instance
}

// an actual alive thing with stuff happening to it. classical prototype.
