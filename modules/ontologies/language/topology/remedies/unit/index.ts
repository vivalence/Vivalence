import annotations from "./annotation/index.ts";
import tags from "./tags/index.ts";
import required from "./required.js";

export default [required, ...tags, ...annotations];
