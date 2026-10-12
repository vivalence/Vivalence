import { Vector, shard } from "@vivalence/typology";
import * as population from "./population.js";
import * as resolution from "./resolution.js";
import * as integration from "./integration.js";
import { execution as lighthouse } from "../lighthouse/execution.js";
import { execution as daemon } from "../daemon/execution.js";
import { execution as mode } from "../mode/execution.js";
import { execution as terminal } from "../terminal/execution.js";
import { execution as thread } from "../thread/execution.js";

export const execution = new Vector()
  .use(shard.controller.settle)
  .use(population.lighthouse)
  .use(population.repl)
  .use(integration.cover)
  .use(integration.keys)
  .use(resolution.lighthouse(lighthouse))
  .use(population.entities)
  .use(population.daemons)
  .use(population.modes)
  .use(population.userspace)
  .use(integration.surface)
  .use(resolution.runtime(daemon(mode)))
  .use(resolution.daemons(daemon(mode)))
  .use(resolution.terminals(terminal))
  .use(resolution.seat(thread))
  .use(resolution.home)
  .do(shard.controller.hold);
