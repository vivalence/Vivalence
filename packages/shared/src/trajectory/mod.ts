import { Pattern, Signal, Factory } from "./types.ts";

// import { createFactory } from "./src/factory.ts";
import { Trajectory } from "./src/trajectory.ts";
// import { Walker } from "./src/walker.ts";

import * as path from "./src/parsers/path.ts";
import * as key from "./src/parsers/key.ts";

// export const PatternFactory: Factory<Pattern> = createFactory<Pattern>();
// export const SignalFactory: Factory<Signal> = createFactory<Signal>();

const parsers = { key, path };

export { Trajectory, parsers };
