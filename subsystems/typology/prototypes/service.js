import { Vector, parser } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";

// { slug, data: f(config.join), runtime, client, config, secrets, status, prototype }

// module: "@vivalence/service/leuchtturm",
// data: "/repository/config/data/runtime__service_",
// secret: { jwt: "" },
// slug: "identity",
// runtime: "eng2lat"

// slug = ''; runtime = ''; module = ''; config = {}; secret = {}; data = f(config);

// also (mis)used as ServiceMapEntry
export class Service {
  // construct
  aperture = new Aperture();
  withConfig(config) {
    Object.assign(this, config);
    return this;
  }
  implements(trait) {
    if (!this.manifest) {
      this.manifest = this.prototype.manifest;
      this.manifest.traits = this.manifest.traits || [];
    }
    return this.manifest.traits.includes(trait);
  }

  // preflight

  // populate

  // resolve

  // integrate
}
