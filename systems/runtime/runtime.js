import { Url, Vector, Aperture } from "@vivalence/typology";

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
