import { Entity, is, v } from "@vivalence/typology";

const WORD = [
  [(thread) => thread.traits.includes("LABELED"), (thread) => thread.trait.LABELED.name],
  [(thread) => is.string(thread.mode), (thread) => thread.mode.split("/").at(-1)],
  [() => true, (thread) => thread.mode.slug],
];

export class Thread extends Entity {
  id = null;
  user = null;
  mode = null;
  phase = "manual";
  traits = [];
  trait = {};

  get word() {
    return WORD.find(([test]) => test(this))[1](this);
  }

  get activities() {
    return this.$activities.get();
  }

  toJSON() {
    const kept = Object.entries(super.toJSON()).filter(([key]) => !key.startsWith("$"));
    const mode = this.mode === null || typeof this.mode === "string" ? this.mode : this.mode.id;
    return { ...Object.fromEntries(kept), mode };
  }
}
