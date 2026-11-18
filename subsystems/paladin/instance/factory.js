import { fn } from "@vivalence/typology";
import * as population from "./lifecycle/1-population.js";
import * as resolution from "./lifecycle/2-resolution.js";
import * as integration from "./lifecycle/3-integration.js";

export const factory = fn.memo(
  async (paladin) => {
    await population.environment(paladin);
    await population.recipe(paladin);
    resolution.defaults(paladin);
    resolution.mountpoints(paladin);
    integration.settle(paladin);
    await paladin.telemetry.attach();
    paladin.publish();
    return paladin.instance;
  },
  ([paladin]) => paladin.instance,
);
