import { v } from "../v.js";

const RESTRICTED = "[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}";
const TYPE = "(?:application|audio|font|image|message|model|multipart|text|video)";
const TREE = "(?:vnd\\.|prs\\.|x\\.)?";
const SUFFIX = "(?:\\+[A-Za-z0-9!#$&^_.-]+)?";

export const PATTERN = `^${TYPE}/${TREE}${RESTRICTED}${SUFFIX}$`;

export const type = (opts) =>
  v.string({ pattern: PATTERN, title: "RFC 6838 media type (type/[tree.]subtype[+suffix])", ...opts });

export const VENDOR = "application/vnd.viva";

export const dom = {
  svelte: `${VENDOR}.dom.svelte+javascript`,
  html: `${VENDOR}.dom.html+javascript`,
  react: `${VENDOR}.dom.react+javascript`,
  solid: `${VENDOR}.dom.solid+javascript`,
};
export const tty = {
  react: `${VENDOR}.tty.react+javascript`,
  solid: `${VENDOR}.tty.solid+javascript`,
};
export const javascript = "text/javascript";
export const markdown = "text/markdown";
export const plain = "text/plain";
export const html = "text/html";
export const svg = "image/svg+xml";
export const json = "application/json";

const CODE = new RegExp(`^${VENDOR.replaceAll(".", "\\.")}\\.(?:dom|tty)\\.${RESTRICTED}$`);
export const code = (type) => type === javascript || CODE.test(type);

export const viva = (reference) => `${VENDOR}.${reference.absolute.slice(1).replaceAll("/", ".")}+json`;

export const EXTENSIONS = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  json: "application/json",
  jsonc: "application/json",
  pdf: "application/pdf",
  md: "text/markdown",
  mdx: "text/markdown",
  org: "text/plain",
  txt: "text/plain",
  tex: "application/x-tex",
  html: "text/html",
  csv: "text/csv",
  js: "text/javascript",
  mjs: "text/javascript",
};
export const octet = "application/octet-stream";

export const of = (path) => EXTENSIONS[path.split(".").pop().toLowerCase()] ?? octet;

export const extension = (type) => Object.entries(EXTENSIONS).find(([, held]) => held === type)?.[0] ?? "bin";
