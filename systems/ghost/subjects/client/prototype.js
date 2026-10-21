import { Aperture, NotFound, ReplSignal, belt, fromm, shape, v } from "@vivalence/typology";

const loop = (clientDie) => {
  clientDie.aperture
    .branch("/terminal/:terminal")
    .use(async (ctx, next) => {
      ctx.terminal = clientDie.runtime.entities.terminal.$entities
        .get()
        .find((held) => held.id === ctx.params.terminal);
      if (ctx.terminal === undefined) throw new NotFound(ctx.signal);
      await next();
    })
    .open("/metadata/repl", (ctx) => shape.strip(ctx.terminal.repl.commands))
    .post({ nature: "/repl", input: v.primitives.harness.Signal }, (ctx) =>
      ctx.terminal.repl.dispatch(new ReplSignal(ctx.input)),
    );
};

export class Client {
  controller = null;
  instance = null;
  mask = null;

  register = null;

  app = null;

  modes = {};
  aperture = new Aperture();

  looping = belt.fn.once(loop);
  runtime = null;

  constructor(client) {
    Object.assign(this, client);
  }

  get user() {
    return this.runtime === null ||
      this.runtime.lighthouse === null ||
      this.runtime.lighthouse.user === null
      ? {}
      : this.runtime.lighthouse.user;
  }

  get json() {
    return {
      mask: this.mask,
      modes: fromm.modes(this.modes).flat.map((mode) => mode.reference.absolute),
    };
  }
}
