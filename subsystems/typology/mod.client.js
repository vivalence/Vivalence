// maybe client ought implement its own prototypes. but they must satisfy @typology/gestalt.

// export * as prototypes from "./prototypes/index.ts";
export * as gestalten from "./gestalten/index.ts";
export * as types from "./types.d.ts";

export * from "./gestalten/index.ts";
export * from "./types.d.ts";

// why not all prototypes?
export * from "./prototypes/path.js";
export * from "./prototypes/status.js";
export * from "./prototypes/connection.js";
export * from "./prototypes/call/index.js";

// no primitives on client due to typebox. yet.
