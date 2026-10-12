import { Vector } from "@vivalence/typology";
import * as terminal from "../../prototypes/terminal.js";

export const repl = async (die, next) => {
  die.terminal.$repl.set(new Vector().graft(die.client.repl));
  try {
    await next();
  } finally {
    die.terminal.$repl.set(null);
  }
};

export const stall = async (die, next) => {
  const off = terminal.stall(die.terminal, die.client.runtime.entities);
  try {
    await next();
  } finally {
    off();
  }
};
