import { Signature } from "./signature.js";
import { hash, is } from "@vivalence/typology";

export class Signal extends Signature {
  static coercions = [
    [
      (s) => is.string(s),
      function (s) {
        const tokens = tokenize(s);
        const segments = [];
        const flags = {};
        let terminated = false;

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];

          if (terminated || token === "-") {
            const parts = token.split("/").filter((part) => part.length > 0);
            for (const part of parts) segments.push({ nature: part });
            continue;
          }

          if (token === "--") {
            terminated = true;
            continue;
          }

          if (token.startsWith("--")) {
            const key = token.slice(2);
            const next = tokens[i + 1];
            if (next && next !== "--" && !next.startsWith("-")) {
              flags[key] = next;
              i++;
            } else {
              flags[key] = true;
            }
          } else if (token.startsWith("-") && token.length === 2) {
            const key = token.slice(1);
            const next = tokens[i + 1];
            if (next && next !== "--" && !next.startsWith("-")) {
              flags[key] = next;
              i++;
            } else {
              flags[key] = true;
            }
          } else if (token.startsWith("-") && token.length > 2) {
            for (const character of token.slice(1)) {
              flags[character] = true;
            }
          } else {
            const parts = token.split("/").filter((part) => part.length > 0);
            for (const part of parts) segments.push({ nature: part });
          }
        }

        const hasFlags = Object.keys(flags).length > 0;

        if (segments.length && hasFlags) {
          segments[segments.length - 1].flags = flags;
        }

        if (!segments.length && hasFlags) {
          this.nature = null;
          this.flags = flags;
          return null;
        }

        return segments;
      },
    ],
  ];

  hasher() {
    return hash.array([this.index, this.nature]);
  }

  get pathname() {
    return "/" + this.absolute.join("/");
  }

  get json() {
    return {
      signal: this.pathname,
      parts: this.absolute,
      flags: (this.fin ?? this).flags ?? {},
    };
  }
}

function tokenize(input) {
  const tokens = [];
  let current = "";
  let quote = null;

  for (const character of input) {
    if (quote) {
      if (character === quote) { quote = null; continue; }
      current += character;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === " " || character === "\t") {
      if (current.length) { tokens.push(current); current = ""; }
    } else {
      current += character;
    }
  }

  if (current.length) tokens.push(current);

  return tokens.flatMap((token) => {
    if (token === "-" || token === "--") return [token];
    if (token.startsWith("--") && token.includes("=")) {
      const eq = token.indexOf("=", 2);
      return [token.slice(0, eq), token.slice(eq + 1)];
    }
    if (token.startsWith("-") && !token.startsWith("--") && token.includes("=")) {
      const eq = token.indexOf("=");
      return [token.slice(0, eq), token.slice(eq + 1)];
    }
    return [token];
  });
}
