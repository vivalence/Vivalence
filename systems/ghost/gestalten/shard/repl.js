import { ReplSignal, Vector, fromm, is, shard, steer } from "@vivalence/typology";
import { turn } from "../../entities/terminal/commands/turn.js";

export const message = async (replDie, next) => {
  await next();
  if (replDie.output !== undefined) replDie.controller.stdout.message(replDie.output);
};

export const execution = new Vector()
  .use(shard.controller.open)
  .use(message)
  .do((replDie) => steer.dispatch.execute(replDie.repl, replDie, replDie.signal));

export const scoped = (mode) => {
  const vector = new Vector();
  vector.branch(`/mode/${mode.type}/${mode.slug}`, mode.repl);
  vector.branch(`/mode/${mode.slug}`, mode.repl);
  return vector;
};

const harnessed = (terminal) => is.object(terminal.mode) && terminal.mode.implements("HARNESSED");

export const compose = (client, terminal) =>
  new Vector().graft(
    client.repl,
    ...fromm.modes(client.modes).flat.map((mode) => mode.repl),
    ...(terminal === null ? [] : [terminal.repl, ...client.runtime.entities.mode.$entities.get().map(scoped), ...(harnessed(terminal) ? [turn] : [])]),
  );

export const dispatch = (client, terminal, line) => {
  const signal = new ReplSignal(line);
  const replDie = {
    signal,
    client,
    runtime: client.runtime,
    terminal,
    controller: (terminal === null ? client.controller : terminal.controller).branch(signal.pathname),
    repl: compose(client, terminal),
    output: undefined,
  };
  return steer.dispatch.execute(execution, replDie).then(() => replDie.output);
};
