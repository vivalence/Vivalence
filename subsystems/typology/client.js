// @beef maybe client must implement its own prototypes, but they must satisfy the gestalt and use primitives.

export * as types from "./types.d.ts";
export * from "./gestalten/index.ts";
export * from "./types.d.ts";

export * from "./prototypes/path.js";
export * from "./prototypes/status.js";
export * from "./prototypes/connection.js";
export * from "./prototypes/call/index.js";

// ..primitives? cant because typebox. not yet.
