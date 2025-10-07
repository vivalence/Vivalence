import identity from "./system/Identity.ts";
import valence from "./system/Valence.ts";
import runtime from "./system/Runtime.ts";
import module from "./system/Module.ts";

import topography from "./ontology/Topography.ts";
import constraint from "./ontology/Constraint.ts";
import issue from "./ontology/Issue.ts";
import dimension from "./ontology/Dimension.ts";

import literal from "./corpus/Literal.ts";
import symbol from "./corpus/Symbol.ts";

import intent from "./userspace/Intent.ts";
import session from "./userspace/Session.ts";
import user from "./userspace/User.ts";

export const system = { identity, runtime, valence, module };
export const userspace = { user, intent, session };
export const ontology = { topography, constraint, issue, dimension };
export const corpus = { literal, symbol };
export const maps = { system, userspace, ontology, corpus };
