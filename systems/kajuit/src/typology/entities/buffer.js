import { atom } from "nanostores";
import { fn, View, RemoteRepository } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js";

export class Buffer extends Entity {
  $data = atom({});

  get data() {
    return this.$data.get();
  }

  set data(value) {
    this.$data.set(value ?? {});
  }

  $view = null;

  get view() {
    return this.$view;
  }

  set view(record) {
    this.$view = !record || record instanceof View ? record : new View(record);
  }

  // base toJSON walks own enumerable props — the $data atom (a plain object)
  // leaks through and the accessors don't appear at all; drop the backing
  // fields, re-add the plain values.
  toJSON() {
    const { $data, $view, ...base } = super.toJSON();
    return { ...base, data: this.data, view: this.view };
  }

  context = null;
  hooks = { mount: [], unmount: [], release: [] };

  on = {
    mount: (callback) => {
      this.hooks.mount.push(fn.once(callback));
      return this;
    },
    unmount: (callback) => {
      this.hooks.unmount.push(fn.once(callback));
      return this;
    },
    release: (callback) => {
      this.hooks.release.push(fn.once(callback));
      return this;
    },
  };

  mount() {
    for (const hook of this.hooks.mount) hook(this);
  }
  unmount() {
    for (const hook of this.hooks.unmount) hook(this);
  }
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

  use: [],
};
