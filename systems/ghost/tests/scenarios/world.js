import { parts } from "@vivalence/sheets/scenarios";
import { bundle } from "../../surfaces/chrome/bundle.js";

export { frame, palette, screen, settle } from "@vivalence/sheets/scenarios";

let compiling = null;

export const chrome = () =>
  (compiling ??= parts
    .then(() => Deno.makeTempDir({ prefix: "ghost-app-" }))
    .then((directory) => bundle(`${directory}/app.mjs`))
    .then(({ outfile }) => import(`file://${outfile}`)));
