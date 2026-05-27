import { fn, RemoteRepository } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js"; // RemoteEnity (name the semantic space "Remote")

export class Buffer extends Entity {
  view = null; // bundle
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
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/userspace/entities/buffer"));
    return repo;
  },

  use: [
    async (ctx, next) => {
      await next();
      if (ctx.entity.mode && typeof ctx.entity.mode === "object") {
        ctx.entity.view = ctx.entity.mode.buffered ?? null;
      }
    },
  ],
};
