import { atom } from "nanostores";
import { fn, RemoteRepository } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js"; // RemoteEnity (name the semantic space "Remote")

export class Buffer extends Entity {
  $data = atom({});

  get data() {
    return this.$data.get();
  }

  set data(value) {
    this.$data.set(value ?? {});
  }

  // base toJSON walks own enumerable props — it skips the $data atom and would
  // drop the `data` getter; re-add the plain value so serialized buffers carry data.
  toJSON() {
    return { ...super.toJSON(), data: this.data };
  }

  app = null; // bundle
  context = null;
  hooks = { mount: [], unmount: [], release: [] }; //render: [],

  on = {
    mount: (callback) => {
      // buffer gets rendered
      this.hooks.mount.push(fn.once(callback));
      return this;
    },
    unmount: (callback) => {
      // buffer gets destroyed
      this.hooks.unmount.push(fn.once(callback));
      return this;
    },
    // render: (callback) => {this.hooks.render.push(fn.once(callback)); return this;},
    release: (callback) => {
      // buffer releases itself
      this.hooks.release.push(fn.once(callback));
      return this;
    },
  };

  static from(pojo, app) {
    const buffer = Object.assign(new Buffer(), pojo);
    buffer.app = app;
    return buffer;
  }

  mount() {
    for (const hook of this.hooks.mount) hook(this);
  }
  unmount() {
    for (const hook of this.hooks.unmount) hook(this);
  }
  // render(...a) {for (const hook of this.hooks.render) hook(this, ...a);}
  release(...a) {
    for (const hook of this.hooks.release) hook(this, ...a);
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
    // async (ctx, next) => {await next();},
  ],
};
