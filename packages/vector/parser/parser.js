import { is, hash } from "@vivalence/shared";

export const createParser = (id, parser, signatures) => {
  const applies = (p) => p === id;

  return {
    signal: (signal) => {
      return parser
        .signal(signal)
        .map((signature, index) => ({ parser: id, signature, index }));
    },

    pattern: (pattern, valence = false) => {
      if (is.string(pattern)) pattern = { trail: pattern };
      if (valence) pattern.valence = valence;
      if (!pattern.trail) throw new Error("Pattern misses trail");

      return parser
        .pattern(pattern)
        .map((signature, index) => {
          const [type, , match] = signatures //
            .find(([, probe]) => probe(signature));

          return {
            parser: id,
            type,
            index,
            ...pattern,
            signature,
            match: (signal) => {
              if (!applies(signal.parser)) return null;
              const matchedSignal = match(signature)(signal);
              if (!matchedSignal) return null;
              else return { type, parser, ...matchedSignal };
            },
          };
        })
        .map((pattern) => {
          pattern.hash = hash.array([
            pattern.parser,
            pattern.type,
            pattern.signature,
          ]);

          return pattern;
        });
    },

    params: (matches) => {
      return matches.reduce((params, match) => {
        if (match.params) params = { ...match.params, ...params };
        return params;
      }, {});
    },
  };
};

export default createParser;

// if (patterns.length > 0) {
//   patterns[patterns.length - 1].docs = {
//     ...patterns[patterns.length - 1].docs,
//     ...docs,
//   };
// }
