export const split = {
  signal: (input) => {
    const path = input.startsWith("/") ? input : `/${input}`;
    return path.split("/").filter((s) => s.length > 0);
  },

  pattern: (input) => {
    return input.split("/").filter((s) => s.length > 0);
  },
};

export const signatures = [
  [
    "param",
    (sig) => sig.startsWith(":"),
    (sig) => {
      const param = sig.slice(1);
      return (signal) => ({
        ...signal,
        params: { [param]: signal.segment },
      });
    },
  ],
  ["wildcard", (sig) => sig === "*", () => (signal) => signal],
  [
    "literal",
    (sig) => true,
    (sig) => (signal) => (signal.segment === sig ? signal : null),
  ],
];

// const createParser = (signatures) => {
//   const TYPE = Symbol("signature");
//   const isType = (t) => t === TYPE;

//   return {
//     signal: (input) => {
//       const path = input.startsWith("/") ? input : `/${input}`;
//       return path
//         .split("/")
//         .filter((s) => s.length > 0)
//         .map((signature) => ({ type: TYPE, signature }));
//     },

//     pattern: (input, valence) => {
//       const docs =
//         typeof input === "string"
//           ? { path: input, ...(valence && { valence }) }
//           : input;

//       const signatures = docs.path.split("/").filter((s) => s.length > 0);

//       const patterns = signatures.map((signature) => {
//         const [slug, , match] = signatures //
//           .find(([, probe]) => probe(signature));

//         return {
//           type: TYPE,
//           match: (signal) =>
//             !isType(signal.type) ? null : match(signature)(signal),
//           docs: { ...docs, slug: `signature/${slug}`, signature },
//         };
//       });

//       if (patterns.length > 0) {
//         patterns[patterns.length - 1].docs = {
//           ...docs,
//           ...patterns[patterns.length - 1].docs,
//         };
//       }

//       return patterns;
//     },
//   };
// };

// const signatures = [
//   [
//     "param",
//     (sig) => sig.startsWith(":"),
//     (sig) => {
//       const param = sig.slice(1);
//       return (signal) => ({
//         ...signal,
//         params: { [param]: signal.value.signature },
//       });
//     },
//   ],

//   ["wildcard", (sig) => sig === "*", () => (signal) => signal],

//   [
//     "catch",
//     (sig) => sig === "**",
//     () => (signal) => ({ ...signal, catchAll: true }),
//   ],

//   [
//     "optional",
//     (sig) => sig.startsWith("?"),
//     (sig) => {
//       const param = sig.slice(1);
//       return (signal) => ({
//         ...signal,
//         params: { [param]: signal.value.signature },
//       });
//     },
//   ],

//   [
//     "literal",
//     (sig) => true,
//     (sig) => (signal) => (signal.value.signature === sig ? signal : null),
//   ],
// ];

// export const sig = createParser(signatures);
// export default sig;
