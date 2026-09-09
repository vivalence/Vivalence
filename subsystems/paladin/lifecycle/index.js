import { fn } from "@vivalence/typology";
import * as populate from "./populate.js";
import * as resolve from "./resolve.js";
import * as integrate from "./integrate.js";

export { integrate, populate, resolve };

export const mount = fn.memo(
  async (instance) => {
    await populate.environment(instance);
    await populate.recipe(instance);
    resolve.defaults(instance);
    resolve.mountpoints(instance);
    integrate.settle(instance);
    instance.paladin.publish();
    return instance;
  },
  ([instance]) => instance,
);
