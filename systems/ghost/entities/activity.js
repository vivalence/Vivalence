import { Controller, Entity, RemoteRepository, Span, Vector, v } from "@vivalence/typology";

export class Activity extends Entity {
  user;
  mode;
  thread;
  buffer;
  turn;
  type;
  steps = [];
  controller = new Controller({ stdout: new Span("activity") });

  get status() {
    return this.controller.status.reflection.code;
  }
  set status(code) {
    this.controller.status.set(code);
  }
  set error(error) {
    if (error !== null) this.controller.status.set({ error });
  }

  toJSON() {
    const { controller, ...base } = super.toJSON();
    return { ...base, status: this.status };
  }
}

export const repository = (dataspace) => new RemoteRepository(Activity).connect(dataspace.runtime.connection.branch("/userspace/entities/activity"));

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  const remote = ctx.runtime.connection.branch(`/userspace/entities/activity/${ctx.entity.id}`);
  for (const name of Object.keys(v.primitives.controller.MACHINE.signals)) ctx.entity.controller.stdin.open(name, (signalDie) => remote.call(`/stdin/${name}`, signalDie.input));
});
