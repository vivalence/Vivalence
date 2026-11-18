import paladin from "@vivalence/paladin";
import { atom } from "nanostores";
import { NotFound, ReplSignal, Vector, fromm, is, shape, shard, steer } from "@vivalence/typology";
import * as belt from "../../gestalten/belt/index.js";
import * as commands from "../../gestalten/commands/index.js";

const answered = async (replDie, next) => {
  await next();
  if (replDie.output === undefined) return;
  replDie.controller.stdout.log(belt.outline(replDie.output));
};

export const execution = new Vector()
  .use(shard.controller.open)
  .use(answered)
  .do((replDie) => {
    const [effect, carry, steps] = steer.dispatch.traverse(replDie.repl.commands, replDie.signal);
    if (!effect) throw new NotFound(replDie.signal);
    replDie.params = fromm.match(steps).parameters;
    return steer.strategy.direct(carry, effect)(replDie);
  });

export class Repl {
  $catalog = atom(null);

  constructor(terminal) {
    this.terminal = terminal;
  }

  get catalog() {
    return this.$catalog.get();
  }

  get commands() {
    return steer.trie.sieve(new Vector().graft(
      commands.system.anima,
      commands.system.doctor,
      commands.system.help,
      commands.system.lighthouse,
      ...(paladin.is.tty ? [commands.system.quit] : []),
      commands.system.runtime,
      ...(this.terminal.client.app === null ? [] : [
        commands.surface.filter,
        commands.surface.focus,
        commands.surface.font,
        commands.surface.popover,
        commands.system.repl,
        commands.surface.sidebar,
        commands.surface.telemetry,
        commands.content.terminal,
        commands.surface.theme,
        commands.surface.widget,
        commands.surface.widgets,
      ]),
      ...fromm.modes(this.terminal.client.modes).flat.map((mode) => mode.repl),
      commands.content.activity,
      commands.content.buffer,
      commands.surface.cell,
      commands.content.upload,
      commands.surface.dock,
      commands.surface.frame,
      commands.content.harness,
      commands.system.leader,
      commands.content.mode,
      commands.system.set,
      commands.content.thread,
      commands.content.turn,
      ...(is.object(this.terminal.mode) ? [this.terminal.mode.repl] : []),
    ), (pattern) => pattern.rank !== "void");
  }

  dispatch(typed) {
    const signal = new ReplSignal(typed);
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

  narrow(command, words) {
    this.$catalog.set([
      {
        ...command,
        chord: "",
        args: true,
      },
    ]);
    this.terminal.client.app.bridge.$draft.set(`${command.nature} ${words.join(" ")}`);
    this.terminal.client.app.bridge.$selected.set(0);
    this.terminal.client.app.bridge.$focus.set("repl.input");
  }

  submit(typed) {
    if (this.catalog !== null) belt.focus.back(this.terminal.client.app.bridge);
    this.$catalog.set(null);
    this.terminal.client.app.bridge.$draft.set("");
    this.terminal.client.app.bridge.$selected.set(0);
    return this.dispatch(typed);
  }
}
