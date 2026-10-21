import paladin from "@vivalence/paladin";
import { atom } from "nanostores";
import { ReplSignal, Vector, fromm, is, shard, steer } from "@vivalence/typology";
import * as clientCommand from "../client/commands/index.js";
import * as appCommand from "../app/commands/index.js";
import * as terminalCommand from "./commands/index.js";

export const execution = new Vector()
  .use(shard.controller.open)
  .do((replDie) => steer.dispatch.execute(replDie.repl.commands, replDie, replDie.signal));

export class Repl {
  $catalog = atom(null);

  constructor(terminal) {
    this.terminal = terminal;
  }

  get catalog() {
    return this.$catalog.get();
  }

  get commands() {
    const absent = paladin.is.tty ? [] : [clientCommand.quit];
    return new Vector().graft(
      ...Object.values(clientCommand).filter((command) => !absent.includes(command)),
      ...(this.terminal.client.app === null ? [] : Object.values(appCommand).filter((command) => !absent.includes(command))),
      ...fromm.modes(this.terminal.client.modes).flat.map((mode) => mode.repl),
      ...Object.values(terminalCommand),
      ...(is.object(this.terminal.mode) ? [this.terminal.mode.repl] : []),
    );
  }

  dispatch(line) {
    const signal = new ReplSignal(line);
    const replDie = {
      signal,
      client: this.terminal.client,
      runtime: this.terminal.client.runtime,
      terminal: this.terminal,
      controller: this.terminal.controller.branch(signal.pathname),
      repl: this,
      output: undefined,
    };
    return steer.dispatch.execute(execution, replDie).then(() => replDie.output);
  }
}
