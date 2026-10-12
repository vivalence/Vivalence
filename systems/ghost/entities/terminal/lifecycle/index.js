import { Vector, shard } from "@vivalence/typology";
import * as commands from "../commands/index.js";

export const verbs = async (terminalDie, next) => {
  terminalDie.terminal.repl.graft(commands.mode, commands.application);
  terminalDie.controller.stdout.message({ terminal: terminalDie.terminal.id });
  await next();
};

export const execution = new Vector().use(verbs).do(shard.controller.hold);
