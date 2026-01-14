import { is } from "@vivalence/typology";
import { hash } from "@vivalence/shared";
import { Signature } from "./signature.js";

export class Pattern extends Signature {
  static coercions = [
    [
      (s) => is.string(s),
      (s) => {
        return s
          .split("/")
          .filter((s) => s.length > 0)
          .map((signature) => {
            const [type, , filter] = probe(signature);
            if (type && filter) return { type, nature: signature, filter };
          })
          .filter(Boolean);
      },
    ],
  ];

  hasher() {
    return hash.array([this.index, this.type, this.nature, this.trace?.hash]);
  }

  apply(signal) {
    return this.filter ? this.filter(signal, this) : null;
  }
}

const probe = (signature) => patternmap.find(([, probe]) => probe(signature));

const patternmap = [
  ["wildcard", (signature) => signature === "*", (signal) => signal],
  ["remainder", (signature) => signature === "(.*)", (signal) => signal],
  [
    "parameter",
    (signature) => signature.startsWith(":"),
    (signal, pattern) => {
      const parameter = pattern.nature.slice(1);
      return {
        ...signal,
        parameter,
        parameters: { [parameter]: signal.nature },
      };
    },
  ],
  [
    "literal",
    (signature) => true,
    (signal, pattern) => (signal.nature === pattern.nature ? signal : null),
  ],
];
// import { is } from "@vivalence/typology";
// import { hash } from "@vivalence/shared";
// import { Signature } from "./signature.js";

// export class Pattern extends Signature {
//   // filter = null;
//   hasher() {
//     return hash.array([this.index, this.type, this.nature, this.trace?.hash]);
//     // i could make the hash reactive for shits and giggles.
//   }

//   ought(thing) {
//     return is.pattern(thing);
//   }

//   parse(string) {
//     const segments = string
//       .split("/")
//       .filter((s) => s.length > 0)
//       .map((signature) => {
//         const [type, , filter] = probe(signature);
//         if (type && filter) return { type, nature: signature, filter };
//       })
//       .filter((segment) => segment);
//     return segments;
//   }

//   apply(signal) {
//     // assert constraints. // ie this: this.filter = signature; // TODO wrap for asserting filter in output.
//     // yeah i need to do some stuff here.
//     return this.filter ? this.filter(signal, this) : null;
//   }
//   from(trace) {
//     this.trace = trace;
//     this.trace?.gauges.push(this);
//     if (is.fn(trace?.nature) && !this.nature) {
//       this.nature = trace.nature;
//       this.filter = trace.nature;
//     }
//     return this;
//   }
// }

// const probe = (signature) => patternmap.find(([, probe]) => probe(signature));

// const patternmap = [
//   ["wildcard", (signature) => signature === "*", (signal) => signal],
//   ["remainder", (signature) => signature === "(.*)", (signal) => signal],
//   [
//     "parameter",
//     (signature) => signature.startsWith(":"),
//     (signal, pattern) => {
//       const parameter = pattern.nature.slice(1);
//       return {
//         ...signal,
//         parameter,
//         parameters: { [parameter]: signal.nature },
//       };
//     },
//   ],
//   [
//     "literal",
//     (signature) => true,
//     (signal, pattern) => (signal.nature === pattern.nature ? signal : null),
//   ],
// ];
