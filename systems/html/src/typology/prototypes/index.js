export * from "./mode.js";
export * from "./entity.js";
export * from "./repository.js";

export * from "./lighthouse/prototype.js";
export * from "./daemon/prototype.js";

import * as lighthouse from "./lighthouse/index.js";
import * as daemon from "./daemon/index.js";

export const entities = { lighthouse, daemon };
