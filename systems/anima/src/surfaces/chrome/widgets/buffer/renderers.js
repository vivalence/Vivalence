import { mime } from "@vivalence/typology";
import { tokens } from "@vivalence/dapper";
import { Html, Image, JsonTree, Markdown, Mounted, Summary } from "./painters.jsx";

export const RENDERERS = [
  [(buffer, views) => views.length > 0, Mounted],
  [(buffer) => buffer.mime === mime.markdown, Markdown],
  [(buffer) => buffer.mime === mime.json, JsonTree],
  [(buffer) => buffer.mime.endsWith("+json"), JsonTree],
  [(buffer) => buffer.mime.startsWith("image/"), Image],
  [(buffer) => buffer.mime === mime.html, Html],
  [() => true, Summary],
];

export const renderer = (buffer, views) => RENDERERS.find(([test]) => test(buffer, views))[1];

export const surfaced = (app) => ({
  kind: "dom",
  get palette() {
    return tokens.kebab(app.theme, "2");
  },
});
