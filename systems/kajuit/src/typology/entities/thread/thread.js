import { atom, deepMap, computed } from "nanostores";
import { Entity } from "../../prototypes/entity.js";
import * as aimed from "./traits/aimed.js";
import * as queueing from "./traits/queueing.js";

// A phase requires a set of trait-validity rules to hold before it can engage. The phase owns
// the SET; each trait module owns its rule (composition + implementation, not presence).
// inert/manual/escort have no config contract; continuous fetches, so it folds AIMED + QUEUEING.
const PHASES = {
  inert: [],
  manual: [],
  continuous: [aimed.valid, queueing.valid],
  escort: [],
};

// fold a phase's rules over the live thread → the violation list (empty = honourable).
const violations = (name, thread) =>
  (PHASES[name] ?? []).map((rule) => rule(thread)).filter(Boolean);

export class Thread extends Entity {
  // user = null;
  $mode = atom(null);
  // intent = null;
  // counter = 0;

  $phase = atom("manual"); // render phase — the terminal's stall mirrors this (ThreadPhaseEnum)
  $traits = atom([]);
  $trait = deepMap({});
  // $buffer = atom(null);
  $label = atom("");

  // the LIVE integrity of every phase: { phase → problems[] }, refolded whenever the thread's
  // composition (traits/config/mode) changes. drivers read it (chip disabled + why); engage
  // gates on it. continuous + escort errors face — what the M5 reporters surface.
  $errors = atom([]);
  $integrity = computed([this.$traits, this.$trait, this.$mode], () =>
    Object.fromEntries(Object.keys(PHASES).map((name) => [name, violations(name, this)])),
  );

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

  // the ONE phase gate every driver flows through: validate the phase's data contract live,
  // record the violations ($errors), and only engage an honourable phase. a non-functional
  // phase never reaches the stall. returns false (refused) so the driver can skip persistence.
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

  // get buffer() {
  //   return this.$buffer.get();
  // }
  // set buffer(value) {
  //   this.$buffer.set(value);
  // }

  get label() {
    return this.$label.get();
  }
  set label(value) {
    this.$label.set(value);
  }
}
