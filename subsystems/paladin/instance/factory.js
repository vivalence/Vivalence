import { fn } from "@vivalence/typology";
import * as population from "./lifecycle/1-population.js";
import * as resolution from "./lifecycle/2-resolution.js";
import * as integration from "./lifecycle/3-integration.js";

export const factory = fn.memo(
  async (instance) => {
    await population.environment(instance);
    await population.recipe(instance);
    resolution.defaults(instance);
    resolution.mountpoints(instance);
    integration.settle(instance);
    instance.paladin.publish();
    return instance;
  },
  ([instance]) => instance,
);
