import * as is from "../gestalten/is/index.js";
import { Argv } from "./argv.js";

export class ReplSignal extends Argv {
  static coercions = [
    [(line) => is.string(line) && !line.startsWith("/") && !line.startsWith("--"), (line) => [{ nature: "*", body: [{ type: "text", text: line }], flags: {} }]],
    [
      (line) => is.string(line),
      function (line) {
        return this.coerce(ReplSignal.tokens(line.startsWith("/") ? line.slice(1) : line));
      },
    ],
    ...Argv.coercions,
  ];
}
