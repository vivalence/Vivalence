import { atom, deepMap } from "nanostores";
import { Entity } from "../../prototypes/entity.js";

export class Thread extends Entity {
  // user = null;
  $mode = atom(null);
  // intent = null;
  // counter = 0;

  // socket = null;
  // streams = null;

  // $conversation = atom(null);
  // $phase = atom("stream");
  $traits = atom([]);
  $trait = deepMap({});
  // $buffer = atom(null);
  $label = atom("");

  get mode() {
    return this.$mode.get();
  }
  set mode(value) {
    this.$mode.set(value);
  }

  // get conversation() {
  //   return this.$conversation.get();
  // }
  // set conversation(value) {
  //   this.$conversation.set(value);
  // }

  // get phase() {return this.$phase.get();} set phase(value) {this.$phase.set(value);}

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
