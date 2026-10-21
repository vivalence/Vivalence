import { atom, computed, deepMap } from "nanostores";
import { Entity, Bundle, fn, v } from "@vivalence/typology";

export class Buffer extends Entity {
  views = [];
  files = [];
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
    this.$trait.set(v.buffer.traits.fill(value ?? {}));
  }

  $label = computed(this.$trait, (trait) => trait.LABELED ?? null);
  get label() {
    return this.$label.get();
  }

  toJSON() {
    const { $data, $bundle, $traits, $trait, ...base } = super.toJSON();
    return {
      ...base,
      data: this.data,
      bundle: this.bundle,
      traits: this.traits,
      trait: this.trait,
    };
  }

  context = null;
  hooks = { attach: [], detach: [], release: [] };
  on = {
    attach: (callback) => {
      this.hooks.attach.push(fn.once(callback));
      return this;
    },
    detach: (callback) => {
      this.hooks.detach.push(fn.once(callback));
      return this;
    },
    release: (callback) => {
      this.hooks.release.push(fn.once(callback));
      return this;
    },
  };
  attach() {
    for (const hook of this.hooks.attach) hook(this);
  }
  detach() {
    for (const hook of this.hooks.detach) hook(this);
  }
  release(...detail) {
    for (const hook of this.hooks.release) hook(this, ...detail);
  }
}
