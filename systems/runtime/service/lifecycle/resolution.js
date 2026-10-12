import { stagger } from "../../gestalten/belt/index.js";
import * as catalog from "../traits/index.js";

export const traits = async (die, next) => {
  die.service.finalizers = await stagger(die.service, die.mask, catalog);
  for (const finalize of die.service.finalizers) await finalize();
  try {
    await next();
  } finally {
    for (const terminate of (die.service.terminators ?? []).reverse()) await terminate();
  }
};
