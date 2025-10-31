import { is } from "@vivalence/typology";
import { atom } from "nanostores";

export const Status = (initial = { code: "IDLE" }) => {
  if (is.string(initial)) initial = { code: initial };
  const $status = atom({
    code: initial.code,
    timestamp: initial.timestamp || new Date().toISOString(),
    error: initial.error,
  });

  $status.update = (update) => {
    $status.set({
      ...$status.get(),
      ...update,
      timestamp: new Date().toISOString(),
    });
  };

  return $status;
};

// import { atom } from "nanostores";

// export class Status {
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
