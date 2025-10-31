import { Vector } from "@vivalence/vector"; //
import { Status, Path, Url } from "@vivalence/typology";
import { Aperture } from "@vivalence/vector/aperture";

export class Gaia {
  process = null; // must capture process
  status = new Status("<uninitialized>", this);
  server = null; // runs an oak server
  aperture = new Aperture();
  twitch = new Vector();

  // whatever pup uses internally to represent processes
  things = []; // [DaemonDie | ServiceDie]
}

// an actual alive thing with stuff happening to it. classical prototype.
