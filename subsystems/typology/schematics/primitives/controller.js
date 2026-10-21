import { v } from "../v.js";

export const machine = {
  states: {
    IDLE: {}, RUNNING: {}, PAUSED: {}, STOPPING: {},
    DONE: { settled: true }, STOPPED: { settled: true }, FAILED: { settled: true }, ABORTED: { settled: true },
  },
};

export const State = v.enum(Object.keys(machine.states)).desc('Four live, four settled. Example: "STOPPING"');
export const SIGNALS = ["SIGTERM", "SIGSTOP", "SIGCONT", "SIGKILL"];
export const Signal = v.enum(SIGNALS).desc('The stdin natures. Example: "SIGTERM"');
export const Machine = v.object({ states: v.record(State, v.object({ settled: v.boolean().optional() })) }).desc('The statuses of a controller, each settled or live. Example: { "states": { "IDLE": {}, "DONE": { "settled": true } } }');

const [fault] = Machine.faults(machine);
if (fault) throw new Error(`[controller] machine ${fault.at}: ${fault.reason}`);
export const MACHINE = machine;

export const Kill = v.object({
  nature: Signal,
  body: v.array(v.unknown()),
  flags: v.record(v.string(), v.unknown()).optional(),
}).desc('One stdin packet as it crosses a wire. Example: { "nature": "SIGTERM", "body": ["user pressed stop"], "flags": {} }');

export const Record = v.object({
  at: v.number(),
  path: v.array(v.string()),
  track: v.string(),
  data: v.unknown().optional(),
}).desc('One span record as it crosses a wire. Example: { "at": 1761213600000, "path": ["runtime/localhost", "hallucination"], "track": "start", "data": null }');

export const Reflection = v.object({
  path: v.array(v.string()),
  code: State,
  timestamp: v.string(),
  error: v.object({}, { additionalProperties: true }).optional(),
  children: v.array(v.unknown()),
}).desc('A controller at rest, folded over its children. Example: { "path": ["hallucination"], "code": "RUNNING", "timestamp": "2026-09-14T10:00:00.000Z", "children": [] }');
