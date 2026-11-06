import { v } from "../v.js";
import { VirtualSchematic } from "./base.js";

export const ActivitySchematic = {
  ...VirtualSchematic,
  $id: "Activity",
  is: "one running act — a hallucination — on a thread: its controller's status, its steps; never stored, dies with the process",
  own: {
    type: v.enum(["HALLUCINATION"]).default("HALLUCINATION").desc("what kind of act").examples("HALLUCINATION"),
    status: v.string().default("IDLE").desc("the controller's status code: IDLE · RUNNING · PAUSED · DONE · FAULTED").examples("RUNNING"),
    error: v.unknown().default(null).desc("the fault, when FAULTED").examples(null),
    steps: v.array(v.record(v.string(), v.unknown())).default([]).desc("what it did so far, in order").examples([{ track: "request", at: 1762704681476 }]),
  },
  relations: {
    user: () => v.rel().optional().desc("who it acts for").examples("01a09010-0000-7000-8000-000000000001"),
    mode: () => v.rel().optional().desc("the mode acting").examples("01a09010-13a9-7f1e-a2c4-6b0d1f2e3a44"),
    thread: () => v.rel().optional().desc("the thread it acts on").examples("01a09010-13aa-778b-bce7-19c38f835337"),
    buffer: () => v.rel().optional().desc("the buffer it writes"),
    turn: () => v.rel().optional().desc("the turn it answers"),
  },
  examples: [{ id: "019d23f1-8c4e-7a2b-9f10-3e5a1c2d4b6f", user: "01a1b1c0-d3b4-724a-9452-32d250140280", mode: "01a1b1c0-f0c1-7559-a38c-d59d34854a75", thread: "01a1b609-5607-741b-98df-9899bdc62e02", buffer: null, turn: null, type: "HALLUCINATION", status: "RUNNING", error: null, steps: [{ track: "request", at: 1762704681476 }] }],
};
