import { Controller, Span, fromm, steer } from "@vivalence/typology";
import { Argv } from "../prototypes/argv.js";
import { paladin } from "../commands/paladin/index.js";

export const surface = ({ interactive = false, answers = [] } = {}) => ({
  interactive,
  stdin: null,
  json: false,
  painted: false,
  width: () => 120,
  emitted: [],
  held: [],
  async emit(kind, props) {
    this.painted = true;
    this.emitted.push({ kind, ...props });
  },
  async hold(kind, props) {
    if (!this.interactive) throw new Error(`${kind}: needs a terminal — run it in one, or pass its inputs as parameters`);
    this.held.push({ kind, ...props });
    return answers.shift();
  },
});

export const recorder = () => {
  const calls = [];
  const call = async (argv) => {
    calls.push(argv);
    return { chained: argv[0] };
  };
  return { calls, call };
};

export async function drive(argv, { view = surface(), call = recorder().call } = {}) {
  const signal = new Argv(argv);
  const ctx = {
    controller: new Controller({ stdout: new Span("shell") }),
    root: paladin,
    signal,
    input: signal.body,
    output: undefined,
    view,
    flags: [],
    call,
  };
  return steer.dispatch.invoke(paladin, signal, (carry, effect, steps) => async () => {
    Object.assign(ctx, { steps, params: fromm.match(steps).parameters });
    await carry(ctx, steer.strategy.resolve(effect));
    return ctx.output;
  })();
}
