import symbol from "./kernel/Symbol.ts";
import literal from "./kernel/Literal.ts";

import memory from "./userspace/Memory.ts";
import play from "./userspace/Play.ts";
import product from "./userspace/Product.ts";

export const entities = [literal, symbol, product, play, memory];
// export default { symbol, literal, memory, play, product };
