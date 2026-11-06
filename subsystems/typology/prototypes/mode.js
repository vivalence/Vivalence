import { Status } from "./status.js";
import { Path } from "./path.js";
import { Twitch } from "./twitch.js";


// live citizen constructed from a registry module (read.viva result).
export class Mode {
  // connection // entity: <em.Module> // url // view? // call

  status = new Status("<uninitialized>", this);
  aperture = null;
  stdout = null;
  daemon = null;
  twitch = new Twitch();

  constructor(module) {
    Object.assign(this, module);
    this.module = module;
  }

  implements(trait) {
    return this.manifest.traits.includes(trait.toUpperCase());
  }
}
