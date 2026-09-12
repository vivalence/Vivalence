import { v } from "../v.js";

export const machine = {
  states: {
    IDLE: {}, RUNNING: {}, PAUSED: {}, STOPPING: {},
    DONE: { settled: true },
    STOPPED: { settled: true }, FAILED: { settled: true }, ABORTED: { settled: true },
  },
  verbs: {
    open: {}, pause: {}, resume: {}, close: {},
    stop: { error: "STOPPED" }, fault: { error: "FAILED" }, abort: { error: "ABORTED" },
  },
  transitions: {
    open:   { IDLE: "RUNNING" },
    pause:  { RUNNING: "PAUSED" },
    resume: { PAUSED: "RUNNING" },
    stop:   { RUNNING: "STOPPING", PAUSED: "STOPPING" },
    close:  { RUNNING: "DONE", PAUSED: "DONE", STOPPING: "STOPPED" },
    fault:  { IDLE: "FAILED", RUNNING: "FAILED", PAUSED: "FAILED", STOPPING: "FAILED" },
    abort:  { IDLE: "ABORTED", RUNNING: "ABORTED", PAUSED: "ABORTED", STOPPING: "ABORTED" },
  },
  signals: { SIGTERM: "stop", SIGSTOP: "pause", SIGCONT: "resume", SIGKILL: "abort" },
};

export const State = v.enum(Object.keys(machine.states)).desc('Four live, four settled. Example: "STOPPING"');
export const Verb = v.enum(Object.keys(machine.verbs)).desc('A control mark on the controller\'s own span. Example: "stop"');
export const Signal = v.enum(Object.keys(machine.signals)).desc('The stdin natures. Example: "SIGTERM"');

export const Machine = v.object({
  states: v.record(State, v.object({ settled: v.boolean().optional() })),
  verbs: v.record(Verb, v.object({ error: State.optional() })),
  transitions: v.record(Verb, v.record(v.string(), State)),
  signals: v.record(Signal, Verb),
}).desc("The controller machine; states, verbs and signals total by type, transitions partial by design.");

const [fault] = Machine.faults(machine);
if (fault) throw new Error(`[controller] machine ${fault.at}: ${fault.reason}`);
export const MACHINE = machine;

export const Kill = v.object({
  signal: Signal,
  input: v.unknown().optional(),
}).desc('One stdin packet as it crosses a wire. Example: { "signal": "SIGTERM", "input": "user pressed stop" }');

export const Record = v.object({
  span: v.integer(),
  trace: v.union([v.integer(), v.null()]),
  path: v.string(),
  verb: v.string(),
  at: v.number(),
  data: v.unknown().optional(),
}).desc('One stdout mark as it crosses a wire; verb is open, Verb is the folding subset. Example: { "span": 7, "trace": 3, "path": "/hallucination", "verb": "open", "at": 12.5 }');

export const Reflection = v.object({
  path: v.string(),
  span: v.integer(),
  code: State,
  timestamp: v.string(),
  error: v.object({ code: State, message: v.string() }, { additionalProperties: true }).optional(),
  children: v.array(v.unknown()),
}).desc('A controller at rest, folded over its children. Example: { "path": "/hallucination", "span": 7, "code": "RUNNING", "timestamp": "2026-09-14T10:00:00.000Z", "children": [] }');
