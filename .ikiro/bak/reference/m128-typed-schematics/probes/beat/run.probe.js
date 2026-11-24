import { Aperture, Controller, Span, steer, Vector } from "@vivalence/typology";
import { Execution } from "./execution.js";
import * as today from "./today.js";
import * as vector from "./vector.js";
import * as call from "./call.js";
import * as annotated from "./annotated.ts";

const mint = () => ({
  mask: { mountpoint: "/viva/instances/probe/mountpoint" },
  aperture: new Aperture(),
  controller: new Controller({ stdout: new Span("probe") }),
  runtime: {},
});

const first = (beat) => beat.toString().split("\n")[1].trim();

const EXECUTIONS = {
  today: new Vector().use(today.aperture).use(today.modes),
  vector: new Execution().graft(vector.aperture, vector.modes),
  call: new Vector().use(call.aperture).use(call.modes),
  annotated: new Vector().use(annotated.aperture).use(annotated.modes),
};

for (const [name, execution] of Object.entries(EXECUTIONS)) {
  const die = mint();
  execution.affect(() => "ran");
  await steer.dispatch.execute(execution, die);
  console.log(name, {
    carry: execution.carry.map(first),
    opened: die.aperture.patterns.map((pattern) => pattern.nature),
    mountpoint: die.runtime.mountpoint,
  });
}
