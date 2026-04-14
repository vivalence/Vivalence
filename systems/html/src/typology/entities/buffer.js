import { Entity } from "../prototypes/entity.js";
import { fn } from "@vivalence/typology";

export class Buffer extends Entity {
  view = null;
  context = null;
  hooks = { mount: [], render: [], tick: [], release: [], destroy: [] };

  on = {
    mount: (callback) => {
      this.hooks.mount.push(fn.once(callback));
      return this;
    },
    render: (callback) => {
      this.hooks.render.push(fn.once(callback));
      return this;
    },
    tick: (callback) => {
      this.hooks.tick.push(callback);
      return this;
    },
    release: (callback) => {
      this.hooks.release.push(fn.once(callback));
      return this;
    },
    destroy: (callback) => {
      this.hooks.destroy.push(fn.once(callback));
      return this;
    },
  };

  static from(pojo, view) {
    const buffer = Object.assign(new Buffer(), pojo);
    buffer.view = view;
    return buffer;
  }

  mount() {
    for (const hook of this.hooks.mount) hook(this);
  }
  render(...a) {
    for (const hook of this.hooks.render) hook(this, ...a);
  }
  tick(...a) {
    for (const hook of this.hooks.tick) hook(this, ...a);
  }
  release(...a) {
    for (const hook of this.hooks.release) hook(this, ...a);
  }
  destroy() {
    for (const hook of this.hooks.destroy) hook(this);
  }
}

export const BufferDossier = {
  name: "buffer",
  kind: () => Buffer,
  remote: { endpoint: "/userspace/entities/buffer" },

  use: [
    async (ctx, next) => {
      await next();
      if (ctx.entity.mode && typeof ctx.entity.mode === "object") {
        ctx.entity.view = ctx.entity.mode.buffered ?? null;
      }
    },
  ],
};
