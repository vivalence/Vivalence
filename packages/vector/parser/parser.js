import { is, hash } from "@vivalence/shared";

export const createParser = (parser, split, signatures) => {
  const isType = (t) => t === parser;

  return {
    signal: (signal) => {
      return split.signal(signal).map((segment) => ({ type: parser, segment }));
    },

    pattern: (pattern, valence = false) => {
      if (is.string(pattern)) pattern = { pattern };
      if (valence) pattern.valence = valence;

      const patterns = split
        .pattern(pattern.pattern)
        .map((segment, index) => {
          const [signature, , match] = signatures //
            .find(([, probe]) => probe(segment));

          return {
            parser,
            signature,
            index,
            segment,
            ...pattern,
            match: (signal) =>
              !isType(signal.type) ? null : match(segment)(signal),
          };
        })
        .map((pattern) => {
          pattern.hash = hash.array([
            parser,
            pattern.segment,
            pattern.signature,
            pattern.index,
          ]);
          return pattern;
        });

      return patterns;
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
