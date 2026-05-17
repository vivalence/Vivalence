import { init } from "./init.js";
import { start } from "./start.js";
import { stop } from "./stop.js";
import { status } from "./status.js";
import { remove } from "./remove.js";

export function instance(trajectory) {
  const branch = trajectory.branch("/instance");
  init(branch);
  start(branch);
  stop(branch);
  status(branch);
  remove(branch);
}
