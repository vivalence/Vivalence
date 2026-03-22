import symbol from "./kernel/Symbol.ts";
import literal from "./kernel/Literal.ts";

import memory from "./userspace/Memory.ts";
import buffer from "./userspace/Buffer.ts";
// import play from "./userspace/Play.ts";

export const entities = [literal, symbol, buffer, memory]; // play,
