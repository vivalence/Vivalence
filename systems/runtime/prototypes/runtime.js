import { Application } from "@oak/oak";
import { Vector } from "@vivalence/vector"; //
import { Status, Path, Url } from "@vivalence/typology";
import { Aperture } from "@vivalence/vector/aperture";

export class Runtime {
  status = new Status("<uninitialized>", this);
  aperture = new Aperture();
  twitch = new Vector();
  ters = null; // tars pup brother.
  terra = {
    daemons: [], // [DaemonDie]
    processes: [], // [ServiceDie | ]
  };
  server = new Application(); // runs an oak server
  abort = new AbortController(); // yeet that babye
  process = null; // must capture process

  get terrans() {
    return Object.values(this.terra).flat();
  }
}
