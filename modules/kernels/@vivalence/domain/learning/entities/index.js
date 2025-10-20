import symbol from "./kernel/Symbol.ts";
import literal from "./kernel/Literal.ts";

import memory from "./userspace/Memory.ts";
import play from "./userspace/Play.ts";
import exercise from "./userspace/Exercise.ts";

export const entities = [literal, symbol, exercise, play, memory];
// export default { symbol, literal, memory, play, exercise };
