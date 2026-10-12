import { Signal, is } from "@vivalence/typology";

export class Argv extends Signal {
  static coercions = [
    [
      (argv) => is.array(argv) && argv.every(is.string),
      function (argv) {
        const terminator = argv.indexOf("--");
        const options = terminator < 0 ? argv : argv.slice(0, terminator);
        const operands = terminator < 0 ? [] : argv.slice(terminator + 1);
        const at = options.findIndex((token) => !token.startsWith("--"));
        const head = at < 0 ? "" : options[at];
        const rest = at < 0 ? options : [...options.slice(0, at), ...options.slice(at + 1)];
        const segments = head
          .split("/")
          .filter((part) => part.length > 0)
          .map((nature) => ({ nature }));
        const positionals = [];
        const flags = {};
        for (const token of rest) {
          if (!token.startsWith("--")) {
            positionals.push(token);
            continue;
          }
          const equals = token.indexOf("=");
          if (equals > 2) flags[Signal.flag(token.slice(2, equals))] = token.slice(equals + 1);
          else flags[Signal.flag(token.slice(2))] = true;
        }
        const body = [...positionals, ...operands].map(datum);
        if (!segments.length) {
          if (argv.length) this.nature = null;
          this.body = body;
          this.flags = flags;
          return null;
        }
        Object.assign(segments[0], { body, flags });
        return segments;
      },
    ],
    ...Signal.coercions,
  ];

  get argv() {
    const nature = this.absolute.filter(Boolean).join("/");
    const flags = Object.entries(this.flags).map(([key, value]) => (value === true ? `--${key}` : `--${key}=${value}`));
    const operands = this.body.map((datum) => (is.string(datum) ? datum : JSON.stringify(datum)));
    const dashed = operands.some((operand) => operand.startsWith("-"));
    return [...(nature.length ? [nature] : []), ...flags, ...(dashed ? ["--", ...operands] : operands)];
  }
}

function datum(token) {
  if (!token.startsWith("{") && !token.startsWith("[")) return token;
  try {
    return JSON.parse(token);
  } catch {
    return token;
  }
}
