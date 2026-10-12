import { atom, computed, deepMap } from "nanostores";
import { fn, Bundle, Entity, RemoteRepository, Vector } from "@vivalence/typology";

export class Buffer extends Entity {
  $data = atom({});
  get data() {
    return this.$data.get();
  }
  set data(value) {
    this.$data.set(value ?? {});
  }

  $bundle = atom(null);
  get bundle() {
    return this.$bundle.get();
  }
  set bundle(record) {
    this.$bundle.set(!record || record instanceof Bundle ? record : new Bundle(record));
  }

  $traits = atom([]);
  get traits() {
    return this.$traits.get();
  }
  set traits(value) {
    this.$traits.set(value ?? []);
  }

  $trait = deepMap({});
  get trait() {
    return this.$trait.get();
  }
  set trait(value) {
    this.$trait.set(value ?? {});
  }

  $label = computed(this.$trait, (trait) => trait.LABELED ?? null);
  get label() {
    return this.$label.get();
  }

  toJSON() {
    const { $data, $bundle, $traits, $trait, ...base } = super.toJSON();
    return { ...base, data: this.data, bundle: this.bundle, traits: this.traits, trait: this.trait };
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
  release(...detail) {
    for (const hook of this.hooks.release) hook(this, ...detail);
  }
}

export const repository = (dataspace) => new RemoteRepository(Buffer).connect(dataspace.runtime.connection.branch("/userspace/entities/buffer"));

export const hydration = new Vector();
