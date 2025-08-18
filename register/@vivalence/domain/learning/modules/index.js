// import { Module } from "@vivalence/typology/prototypes";
import { mw } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";
//   // constraints/predicates (...that the module must satisfy; exmpl: has trait viewable), guarantees (traits provided by domain and runtime)
// schema using typebox
// fe. requires provision handler
//     is viewable
class Module {
  aperture = new Aperture();
  withManifest(manifest) {
    this.manifest = manifest;
    this.manifest.traits = this.manifest.traits || [];
    return this;
  }
  implements(trait) {
    return this.manifest.traits.includes(trait);
  }
}

class Agent extends Module {
  type = "agent";
}
class Tactic extends Module {
  type = "tactic";
}
class Game extends Module {
  type = "game";
}

class Strategy extends Module {
  type = "strategy";
}

export function lifecycle(mme) {
  // traits [PROVISIONING, MASKED, RELATIONAL, ]
  if (mme.instance.implements("PROVISIONING")) {
    if (mme.module.provision)
      mme.instance.aperture.open("/provision", mme.module.provision);
    if (mme.module.evaluate)
      mme.instance.aperture.open("/evaluate", mme.module.evaluate);
  }
}

export default {
  traits: {
    // traits [PROVISIONING, MASKED, RELATIONAL, ]
  },
  map: {
    game: { prototype: Game }, //
    tactic: { prototype: Tactic },
    agent: { prototype: Agent },
    strategy: { prototype: Strategy },
  },
};
