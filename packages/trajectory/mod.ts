import Trajectory from "./src/trajectory.ts";
import Walker from "./src/walker.ts";
import { Deferred } from "./src/lib.ts";

import path from "./parsers/path.ts";
import key from "./parsers/key.ts";

export const parsers = { key, path };

export { Trajectory, Walker, Deferred };
