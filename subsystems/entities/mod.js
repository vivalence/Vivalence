export * from "./base/VirtualEntity.ts";
export * from "./base/DataEntity.ts";
export * from "./base/BaseEntity.ts";

export * from "./system/Identity.ts";
export * from "./system/Valence.ts";
export * from "./system/Module.ts";
export * from "./system/Runtime.ts";

export * from "./userspace/User.ts";
export * from "./userspace/Session.ts";
export * from "./userspace/Intent.ts";

export * from "./ontology/Issue.ts";
export * from "./ontology/Topography.ts";
export * from "./ontology/Constraint.ts";
export * from "./ontology/Dimension.ts";

import identity from "./system/Identity.ts";
import valence from "./system/Valence.ts";
import runtime from "./system/Runtime.ts";
import module from "./system/Module.ts";

import topography from "./ontology/Topography.ts";
import constraint from "./ontology/Constraint.ts";
import issue from "./ontology/Issue.ts";
import dimension from "./ontology/Dimension.ts";

import intent from "./userspace/Intent.ts";
import session from "./userspace/Session.ts";
import user from "./userspace/User.ts";

export const maps = {
  system: { identity, runtime, valence, module },
  userspace: { user, intent, session },
  ontology: { topography, constraint, issue, dimension },
};

// // ENUMS
// import { ModuleInstallationEnum } from "./0_root/BaseModuleEntity.ts";

// export const enums = { installation: ModuleInstallationEnum };
