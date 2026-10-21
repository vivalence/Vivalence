import paladin from "@vivalence/paladin";
import { atom } from "nanostores";
import { KeySignal, Queue, Vector, fromm, is, shape, shard, steer } from "@vivalence/typology";
import * as app from "../app/keymap.js";
import { keymap } from "../../gestalten/shard/index.js";

export const HELD = [
  [(input) => is.string(input), () => undefined],
  [() => true, (input) => input.preventDefault()],
];

export class Legend {
  presses = new Queue();
  $chord = atom(null);

  constructor(terminal) {
    this.terminal = terminal;
    this.presses.$backlog.listen((presses) => this.traverse(presses));
  }

  get chord() {
    return this.$chord.get();
  }

  get translation() {
    return new Vector()
      .use(shard.context.bind("legend", this))
      .open("*", (ctx) => {
        if (ctx.legend.presses.backlog.length > 0) HELD.find(([test]) => test(ctx.input))[1](ctx.input);
        ctx.legend.presses.enqueue(ctx.signal);
      })
      .open(paladin.is.browser && !paladin.is.apple ? "meta-v" : "ctrl-v", (ctx) => {
        ctx.input.preventDefault();
        ctx.legend.presses.enqueue(new KeySignal("leader"));
      });
  }

  get keymap() {
    return new Vector().graft(
      keymap.fromRepl(this.terminal.repl.commands),
      ...(this.terminal.client.app === null ? [] : [app.keymap]),
      ...fromm.modes(this.terminal.client.modes).flat.map((mode) => mode.keymap),
      ...(is.object(this.terminal.mode) ? [this.terminal.mode.keymap] : []),
      ...(this.terminal.repl.catalog === null ? [] : [app.closing, app.selecting]),
    );
  }

  dispatch(event) {
    steer.dispatch.invoke(this.translation, new KeySignal(event), steer.strategy.echo)(event);
  }

  traverse(presses) {
    if (presses.length === 0) return this.$chord.set(null);
    const keys = presses.map((signal) => signal.nature);
    const [effect, carry, steps, node] = steer.dispatch.traverse(this.keymap, new KeySignal(keys));
    if (effect !== null) return this.execute(effect, carry).catch((error) => this.terminal.controller.stdout.fault(error));
    if (steps.length < keys.length) return this.flush();
    this.$chord.set(shape.strip(node));
  }

  async execute(effect, carry) {
    this.flush();
    const ctx = { client: this.terminal.client, terminal: this.terminal, output: undefined };
    await carry(ctx, steer.strategy.resolve(effect));
    if (ctx.output !== undefined) await this.terminal.repl.dispatch(ctx.output);
  }

  flush() {
    this.presses.flush();
  }
}
