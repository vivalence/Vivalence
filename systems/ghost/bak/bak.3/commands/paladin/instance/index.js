import { Vector } from "@vivalence/typology";
import { cleanup } from "./cleanup.js";
import { clone } from "./clone.js";
import { remove } from "./delete.js";
import { doctor } from "./doctor.js";
import { down } from "./down.js";
import { install } from "./install.js";
import { rename } from "./rename.js";
import { start } from "./start.js";
import { stop } from "./stop.js";
import { tap } from "./tap.js";
import { up } from "./up.js";
import { use } from "./use.js";
import { user } from "./user.js";

export { cleanup, clone, doctor, remove, rename, tap, use };

export const instance = new Vector().graft(clone, tap, use, install, up, down, start, stop, doctor, user, rename, remove, cleanup);
