import { is, cast } from "@vivalence/typology";
import { atom } from "nanostores";

// status has allways {code}.
// optional {error, label, message} ...?
// codes are [<uninitialized>,success,error,active,]
// do i want each key individually
export class Status {
  constructor(initial, subject) {
    if (is.string(initial)) initial = { code: initial };
    if (!initial) initial = { code: null }; // "<uninitialized>"

    this.$transient = atom({
      timestamp: initial.timestamp || new Date().toISOString(),
      code: initial.code?.toUpperCase(),
      error: initial.error,
    });

    if (subject) this.subject = subject;
  }
  get reflection() {
    const obj = this.$transient.get();
    return { ...obj };
  }
  set(update) {
    if (is.string(update)) update = { code: update.toUpperCase() };
    return this.$transient.set({
      ...this.$transient.get(),
      ...update,
      timestamp: new Date().toISOString(),
    });
  }
  update(update) {
    return this.set(update);
  }

  toJSON() {
    return this.reflection;
  }
  is(code = []) {
    const current = this.$transient.get().code;
    if (current == null) return false;
    return cast
      .array(code)
      .map((c) => c.toUpperCase())
      .includes(current.toUpperCase());
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `Status:${this.$transient.get().code}`;
  }
}

// import { atom } from "nanostores";

//   constructor(initial = { code: "IDLE" }) {
//     this.code = atom(initial.code);
//     this.label = atom(initial.label);
//     this.timestamp = atom(initial.timestamp || new Date().toISOString());
//     this.error = atom(initial.error);
//   }

//   set(update) {
//     Object.entries(update).forEach(([key, value]) => {
//       if (this[key]) this[key].set(value);
//     });
//     this.timestamp.set(new Date().toISOString());
//   }
// }
