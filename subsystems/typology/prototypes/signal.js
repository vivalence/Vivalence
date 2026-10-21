import { Signature } from "./signature.js";
import * as hash from "../gestalten/belt/hash.js";
import * as is from "../gestalten/is/scalars.js";

export class Signal extends Signature {
  static coercions = [
    [
      function (other) {
        return other instanceof Signal && !(other instanceof this.constructor);
      },
      function (other) {
        return Object.assign(new this.constructor(other.pathname), { body: other.body, flags: other.flags });
      },
    ],
    [
      (packet) => is.object(packet) && is.string(packet.nature) && packet.nature.startsWith("/") && is.array(packet.body),
      function (packet) {
        return Object.assign(new this.constructor(packet.nature), { body: packet.body, flags: packet.flags });
      },
    ],
    [
      (url) => url instanceof URL,
      function (url) {
        const segments = url.pathname.split("/").filter((part) => part.length > 0).map((nature) => ({ nature }));
        const flags = {};
        for (const [key, value] of url.searchParams) flags[Signal.flag(key)] = value;
        if (!segments.length) {
          this.nature = null;
          this.flags = flags;
          return null;
        }
        segments[0].flags = flags;
        return segments;
      },
    ],
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
            const key = Signal.flag(token.slice(2));
            const next = tokens[i + 1];
            if (next && next !== "--" && !next.startsWith("-")) {
              flags[key] = next;
              i++;
            } else {
              flags[key] = true;
            }
          } else if (token.startsWith("-") && token.length === 2) {
            const key = Signal.flag(token.slice(1));
            const next = tokens[i + 1];
            if (next && next !== "--" && !next.startsWith("-")) {
              flags[key] = next;
              i++;
            } else {
              flags[key] = true;
            }
          } else if (token.startsWith("-") && token.length > 2) {
            for (const character of token.slice(1)) {
              flags[Signal.flag(character)] = true;
            }
          } else {
            const parts = token.split("/").filter((part) => part.length > 0);
            for (const part of parts) segments.push({ nature: part });
          }
        }

        const hasFlags = Object.keys(flags).length > 0;

        if (!segments.length && hasFlags) {
          this.nature = null;
          this.flags = flags;
          return null;
        }

        if (hasFlags) segments[0].flags = flags;
        return segments;
      },
    ],
  ];

  static flag(key) {
    if (/^\d+$/.test(key)) throw new TypeError(`--${key}: numbered flags are refused`);
    return key;
  }

  static tokens(line) {
    return words(line);
  }

  hasher() {
    return hash.array([this.index, this.nature]);
  }

  rebase(signature) {
    const rebased = new this.constructor(this.pathname, new this.constructor(signature));
    for (const key of ["body", "flags"]) if (Object.hasOwn(this, key)) rebased[key] = this[key];
    return rebased;
  }

  get pathname() {
    return "/" + this.absolute.join("/");
  }

  get json() {
    return {
      nature: this.pathname,
      body: this.body,
      flags: this.flags,
    };
  }
}

function words(input) {
  const tokens = [];
  let current = "";
  let quote = null;

  for (const character of input) {
    if (quote) {
      if (character === quote) {
        quote = null;
        continue;
      }
      current += character;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === " " || character === "\t") {
      if (current.length) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += character;
    }
  }

  if (current.length) tokens.push(current);
  return tokens;
}

function tokenize(input) {
  return words(input).flatMap((token) => {
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
