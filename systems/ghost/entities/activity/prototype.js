import { Controller, Entity, Span } from "@vivalence/typology";

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
