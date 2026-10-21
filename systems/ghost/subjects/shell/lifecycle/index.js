import { Argv, Vector, shard, steer } from "@vivalence/typology";
import * as population from "./1-population.js";
import * as resolution from "./2-resolution.js";
import * as integration from "./3-integration.js";
import { commands } from "../commands/index.js";

export { population, resolution, integration };

const rerouted = (nature) => (shellDie) => steer.dispatch.execute(commands, shellDie, new Argv(nature));

export const execution = new Vector()
  .use(shard.controller.open)
  .use((shellDie, next) => {
    shellDie.call = async (argv) => {
      const signal = new Argv(argv);
      const called = { ...shellDie, signal, output: undefined };
      await steer.dispatch.execute(commands, called, signal);
      return called.output;
    };
    return next();
  })
  .use((shellDie, next) => (shellDie.signal.flags.help === true ? rerouted("/help")(shellDie) : next()))
  .use(integration.commanding)
  .graft(commands)
  .do(rerouted("/chrome"));
