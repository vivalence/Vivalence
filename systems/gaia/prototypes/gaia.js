import { Application } from "@oak/oak";
import { Vector } from "@vivalence/vector"; //
import { Status, Path, Url } from "@vivalence/typology";
import { Aperture } from "@vivalence/vector/aperture";

export class Gaia {
  process = null; // must capture process
  ters = null; // tars pup brother.
  server = new Application(); // runs an oak server
  abort = new AbortController(); // yeet that babye
  aperture = new Aperture();
  twitch = new Vector();
  status = new Status("<uninitialized>", this);
  terrans = []; // [DaemonDie | ServiceDie]
}
