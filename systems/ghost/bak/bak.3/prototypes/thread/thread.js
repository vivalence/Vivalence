import { atom, deepMap } from "nanostores";
import { is } from "@vivalence/typology";
import { Entity } from "../entity.js";
import * as aimed from "../../traits/thread/aimed.js";
import * as queueing from "../../traits/thread/queueing.js";

export const PHASES = {
  inert: [],
  manual: [],
  continuous: [aimed.valid, queueing.valid],
  escort: [],
};

export const violations = (name, thread) => PHASES[name].map((rule) => rule(thread)).filter(Boolean);

export const integrity = (thread) => Object.fromEntries(Object.keys(PHASES).map((name) => [name, violations(name, thread)]));

export class Thread extends Entity {
  $mode = atom(null);
  $phase = atom("manual");
  $traits = atom([]);
  $trait = deepMap({});
  $label = atom("");
  $errors = atom([]);
  $echo = atom(null);
  $live = atom(null);
  $activity = atom(null);

  get mode() {
    return this.$mode.get();
  }
  set mode(value) {
    this.$mode.set(value);
  }

  get phase() {
    return this.$phase.get();
  }
  set phase(value) {
    this.$phase.set(value);
  }

  engage(name) {
    const problems = violations(name, this);
    this.$errors.set(problems);
    if (problems.length) return false;
    this.$phase.set(name);
    return true;
  }

  get traits() {
    return this.$traits.get();
  }
  set traits(value) {
    this.$traits.set(value);
  }

  get trait() {
    return this.$trait.get();
  }
  set trait(value) {
    this.$trait.set(value);
  }

  get label() {
    return this.$label.get();
  }
  set label(value) {
    this.$label.set(value);
  }

  get integrity() {
    return this.$integrity.get();
  }
  get echo() {
    return this.$echo.get();
  }
  get live() {
    return this.$live.get();
  }
  get activity() {
    return this.$activity.get();
  }

  toJSON() {
    const kept = Object.entries(super.toJSON()).filter(([key]) => !key.startsWith("$"));
    const mode = this.mode === null || is.string(this.mode) ? this.mode : this.mode.id;
    const values = { mode, phase: this.phase, traits: this.traits, trait: this.trait, label: this.label };
    return { ...Object.fromEntries(kept), ...values };
  }
}
