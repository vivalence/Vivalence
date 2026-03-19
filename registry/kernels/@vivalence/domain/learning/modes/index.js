import { Mode, shards } from "@vivalence/typology";

//   // constraints/predicates (...that the mode must satisfy; exmpl: has trait viewable), guarantees (traits provided by domain and runtime)
// schema using typebox
// fe. requires provision handler
//     is viewable

// class Agent extends Mode {type = "agent";}
class Tactic extends Mode {
  type = "tactic";
}
class Game extends Mode {
  type = "game";
}

// class Teacher extends Mode {type = "teacher";} class Strategy extends Mode {type = "strategy";}

export const traits = {
  smurf: () => {},
};

export const modes = [
  {
    type: "game",
    prototype: Game, // instance = new prototype(modecake)
    // type: GameType  // Typebox.Check(X, daemon.modes.[type].[instance] ) === true
    // entity: GameEntity, // runtime entity instance.entity
    // schema: GameSchema, // persistant database schema
    // repository: GameRepository, // set interface
  },
  // { type: "agent", prototype: Agent },
  { type: "tactic", prototype: Tactic },
  // { type: "teacher", prototype: Teacher },
  // strategy: { prototype: Strategy },
];

// export function lifecycle(mme) {
//   // traits [PROVISIONING, MASKED, RELATIONAL, ]
//   // if (mme.instance.implements("PROVISIONING")) {
//   //   if (mme.mode.provision)
//   //     mme.instance.aperture.open("/provision", mme.mode.provision);
//   //   if (mme.mode.evaluate)
//   //     mme.instance.aperture.open("/evaluate", mme.mode.evaluate);
//   // }
// }
