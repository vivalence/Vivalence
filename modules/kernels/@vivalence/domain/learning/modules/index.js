import { Module } from "@vivalence/typology";
import { shards } from "@vivalence/vector";

//   // constraints/predicates (...that the module must satisfy; exmpl: has trait viewable), guarantees (traits provided by domain and runtime)
// schema using typebox
// fe. requires provision handler
//     is viewable

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
  // if (mme.instance.implements("PROVISIONING")) {
  //   if (mme.module.provision)
  //     mme.instance.aperture.open("/provision", mme.module.provision);
  //   if (mme.module.evaluate)
  //     mme.instance.aperture.open("/evaluate", mme.module.evaluate);
  // }
}

export default {
  game: {
    //   gestalt: PlaySchema,
    //   entity: PlayEntity,
    //   // repository: TopographyRepository,
    prototype: Game,
  }, //
  tactic: { prototype: Tactic },
  agent: { prototype: Agent },
  strategy: { prototype: Strategy },
};
