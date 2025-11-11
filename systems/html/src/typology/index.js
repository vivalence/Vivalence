export * from "./prototypes/index.js";
export * from "./lighthouse/prototype.js";
export * from "./daemon/prototype.js";

export * as prototypes from "./prototypes/index.js";
import * as lighthouse from "./lighthouse/index.js";
import * as daemon from "./daemon/index.js";

export const entities = { lighthouse, daemon };
