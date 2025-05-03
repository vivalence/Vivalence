import Trajectory from "./src/trajectory.ts";
import Walker from "./src/walker.ts";
import { Deferred } from "./src/lib.ts";

import path from "./parsers/path.ts";
import key from "./parsers/key.ts";

const parsers = { key, path };

export { Trajectory };
export const TrajectoryWalker = Walker;
export const TrajectoryDeferred = Deferred;
export const TrajectoryParsers = parsers;
