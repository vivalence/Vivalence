import { Url } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";

export class Runtime {
  server = null;
  handler = null;
  aperture = new Aperture();
  twitch = new Vector();

  ters = null; // tars pup brother.

  daemons = []; // [DaemonDie]
  processes = []; // [ServiceDie | ]

  get terrans() {
    return [this.daemons, this.processes].flat();
  }
}
