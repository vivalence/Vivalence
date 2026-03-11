import symbol from "./kernel/Symbol.ts";
import literal from "./kernel/Literal.ts";

import memory from "./userspace/Memory.ts";
import product from "./userspace/Product.ts";
// import play from "./userspace/Play.ts";

export const entities = [literal, symbol, product, memory]; // play,
// export default { symbol, literal, memory, play, product };
