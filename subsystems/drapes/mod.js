export * from "./context/index.js";
export * from "./decor/index.js";
export * from "./display/index.js";
export * from "./controls/index.js";
export * from "./panels/index.js";
export * from "./triage/index.js";
export * from "./stage/index.js";

import * as decor from "./decor/index.js";
import * as display from "./display/index.js";
import * as controls from "./controls/index.js";
import * as panels from "./panels/index.js";
import * as triage from "./triage/index.js";
import * as stage from "./stage/index.js";

export const components = {
  ...decor,
  ...triage,
  ...display,
  ...controls,
  ...panels,
  ...stage,
};

export default components;
