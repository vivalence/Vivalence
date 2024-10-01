import { handleValidationError, registerHandlers } from "./registry.js";

import annotation from "./annotation/index.js";
import unit from "./unit/index.js";
import tag from "./tag/index.js";

[annotation, unit, tag].map((h) => registerHandlers(h));

export default async function remedy({ issue }, ctx) {
  try {
    const result = await handleValidationError(issue, ctx);
    return result;
  } catch (e) {
    console.error("Error in remedy");
    console.error(e);
  }
}
