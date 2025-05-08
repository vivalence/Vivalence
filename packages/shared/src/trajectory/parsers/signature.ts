import { Signal, Pattern } from "../types/index.ts";
import pathParser from "./path.ts";

export const type = "sig";

export interface SignaturePattern {
  path?: string;
  key?: string;
  modifiers?: string[];
  input?: Record<string, any>;
  output?: Record<string, any>;
  name?: string;
  valence?: string;
  [key: string]: any;
}

export interface SignatureSignal {
  path?: string;
  key?: string;
  modifiers?: string[];
  [key: string]: any;
}

export function signal(
  input: string | SignatureSignal,
): Signal<SignatureSignal>[] {
  if (typeof input === "string") {
    return [new Signal<SignatureSignal>(type, { path: input })];
  }

  const signalValue: SignatureSignal = {};

  if (input.path) signalValue.path = input.path;
  if (input.key) signalValue.key = input.key;
  if (input.modifiers) signalValue.modifiers = input.modifiers;

  return [new Signal<SignatureSignal>(type, signalValue)];
}

export function pattern(
  input: string | SignaturePattern,
): Pattern<SignatureSignal>[] {
  let patternObj: SignaturePattern;

  if (typeof input === "string") {
    patternObj = { path: input };
  } else {
    patternObj = { ...input };
  }

  const docs: Record<string, any> = buildDocs(patternObj);

  // TODO:
  // handle patterns with path parameters and keys. ?? defaults ?? handle in controller ??

  return [
    new Pattern<SignatureSignal>(
      type,
      (signal: Signal<any>) => {
        if (signal.type !== type) return null;

        const signalData = signal.value;
        let result: Record<string, any> = {};

        // Handle path matching using the path parser
        if (patternObj.path && signalData.path) {
          const pathSignals = pathParser.signal(signalData.path);
          const pathPatterns = pathParser.pattern(patternObj.path);

          // i need some way handle sub-signal matching.
          if (pathSignals.length !== pathPatterns.length) {
            return null;
          }

          // Match each segment and collect parameters
          for (let i = 0; i < pathSignals.length; i++) {
            const matchResult = pathPatterns[i].match(pathSignals[i]);
            if (matchResult === null) {
              return null; // Any segment mismatch means no match
            }
            // Extract path parameters from match result
            Object.keys(matchResult).forEach((key) => {
              // Skip the standard signal properties
              if (key !== "type" && key !== "value") {
                // result.params = { [key]: matchResult[key] };
                result[key] = Object.assign({}, result[key], matchResult[key]);
              }
            });
          }
        }

        // Match key if specified
        if (patternObj.key && signalData.key !== patternObj.key) {
          return null;
        }

        // Match modifiers if specified
        if (patternObj.modifiers && patternObj.modifiers.length > 0) {
          if (!signalData.modifiers) return null;

          const modifiersMatch =
            patternObj.modifiers.every((m) =>
              signalData.modifiers.includes(m),
            ) && patternObj.modifiers.length === signalData.modifiers.length;

          if (!modifiersMatch) return null;
        }

        return { ...signal, ...result };
      },
      docs,
    ),
  ];
}
function buildDocs(pattern: SignaturePattern): Record<string, any> {
  const docs: Record<string, any> = {
    name: pattern.name || "",
    valence: pattern.valence || "",
  };

  if (pattern.input) docs.input = pattern.input;
  if (pattern.output) docs.output = pattern.output;

  Object.keys(pattern).forEach((key) => {
    const keys = [
      "path",
      "key",
      "modifiers",
      "input",
      "output",
      "name",
      "valence",
    ];
    if (!keys.includes(key)) {
      docs[key] = pattern[key];
    }
  });
  return docs;
}
export default { signal, pattern, type };
// import { Signal, Pattern } from "../types/index.ts";

// export interface SignaturePattern {
//   docs;
//   path;
//   key;
//   modifiers;
//   in;
//   out;
// }
// export interface SignatureSignal {
//   path;
//   key;
//   modifiers;
// }

// pattern({
//   docs: "Picks units that are due to be practiced, given some ontological constraints.",
//   //
//   path: "/pick/units/pending",
//   key: "",
//   mod: [""],
//   //
//   in: {},
//   out: {},
// });

// signal("/pick/units/pending");
// signal({ path: "/pick/units/pending" });
// signal({ key: "u", modifiers: ["Shift"] });

// runtime.trajectory
//   .branch((p) => p.sig({ path: "/provision", name: "" }))
//   .open(
//     (p) =>
//       p.sig({
//         path: "/fromTagIds",
//         input: { tagIds: { type: "array" } },
//         output: { type: "instruction" },
//       }),
//     provision.fromTagIds,
//   )
//   .open(sig({ path: "/fromLLM" }), provision.fromLLM);
