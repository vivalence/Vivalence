import { v } from "../v.js";

const RESTRICTED = "[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}";
const TYPE = "(?:application|audio|font|image|message|model|multipart|text|video)";
const TREE = "(?:vnd\\.|prs\\.|x\\.)?";
const SUFFIX = "(?:\\+[A-Za-z0-9!#$&^_.-]+)?";

export const PATTERN = `^${TYPE}/${TREE}${RESTRICTED}${SUFFIX}$`;

export const type = (opts) =>
  v.string({ pattern: PATTERN, title: "RFC 6838 media type (type/[tree.]subtype[+suffix])", ...opts });

export const dom = {
  svelte: "application/vnd.vivalence.dom.svelte+javascript",
  html: "application/vnd.vivalence.dom.html+javascript",
  react: "application/vnd.vivalence.dom.react+javascript",
  solid: "application/vnd.vivalence.dom.solid+javascript",
};
export const tty = {
  react: "application/vnd.vivalence.tty.react+javascript",
  solid: "application/vnd.vivalence.tty.solid+javascript",
};
export const markdown = "text/markdown";
export const plain = "text/plain";
export const html = "text/html";
export const svg = "image/svg+xml";
export const json = "application/json";
