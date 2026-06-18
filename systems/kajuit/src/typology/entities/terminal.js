import { atom } from "nanostores";

export class Terminal {
  id = null;
  $thread = atom(null);
  $buffer = atom(null);
  stall = null;

  get thread() {
    return this.$thread.get();
  }
  set thread(value) {
    this.$thread.set(value);
  }

  get daemon() {
    return this.thread?.daemon;
  }

  get buffer() {
    return this.$buffer.get();
  }
  set buffer(value) {
    this.$buffer.set(value);
  }

  constructor(data) {
    Object.assign(this, data);
  }

  toJSON() {
    return {
      id: this.id,
      thread: this.thread?.id ?? this.thread ?? null,
      buffer: this.buffer?.id ?? this.buffer ?? null,
    };
  }
}
