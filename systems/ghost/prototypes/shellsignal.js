import { Signature, is } from "@vivalence/typology";

export class ShellSignal extends Signature {
  static coercions = [
    [
      (input) => is.array(input) && is.string(input[0]),
      function (input) {
        const [head, ...rest] = input;
        const segments = head
          .split("/")
          .filter((part) => part.length > 0)
          .map((nature) => ({ nature }));

        const params = [];
        const flags = {};

        for (const token of rest) {
          if (token.startsWith("--")) {
            const equals = token.indexOf("=");
            if (equals > 2) {
              flags[token.slice(2, equals)] = token.slice(equals + 1);
            } else {
              flags[token.slice(2)] = true;
            }
            continue;
          }
          params.push(token);
        }

        if (segments.length) {
          segments[0].params = params;
          segments[0].flags = flags;
        }

        return segments;
      },
    ],
  ];

  get absolute() {
    const path = this.array.map((segment) => segment.nature).join("/");
    const params = this.params ?? [];
    const flags = this.flags ?? {};

    const argv = [path];
    for (const param of params) argv.push(param);
    for (const [key, value] of Object.entries(flags)) {
      if (value === true) argv.push("--" + key);
      else argv.push("--" + key + "=" + value);
    }
    return argv;
  }

  get json() {
    const json = { nature: this.nature, absolute: this.absolute };
    if (this.params) json.params = [...this.params];
    if (this.flags) json.flags = { ...this.flags };
    if (this.trace?.json) json.trace = this.trace.json;
    return json;
  }
}
