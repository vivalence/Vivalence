import { v } from "../v.js";
import { DataSchematic } from "./base.js";

export const TurnSchematic = {
  ...DataSchematic,
  $id: "Turn",
  is: "one utterance of a thread: a role, its parts, provider metadata; the thread is the chain by createdAt",
  own: {
    role: v.string().desc("who spoke: user · assistant · system").examples("assistant"),
    parts: v.array(v.record(v.string(), v.unknown())).default([]).optional().desc("the content parts, soma's shape: text, tool calls, tool results").examples([{ type: "text", text: "Six species on four continents." }]),
    meta: v.record(v.string(), v.unknown()).optional().desc("what the provider reported").examples({ model: "claude-fable-5-1", tokens: 412 }),
  },
  relations: {
    parent: () => v.rel().optional().desc("the turn before it"),
    children: () => v.array(v.turn()).optional().desc("turns that followed"),
    thread: () => v.rel().desc("the thread it belongs to").examples("01a09010-13aa-778b-bce7-19c38f835337"),
    mode: () => v.rel().optional().desc("the mode that answered").examples("01a09010-13a9-7f1e-a2c4-6b0d1f2e3a44"),
    buffers: () => v.array(v.buffer()).optional().desc("buffers it minted or touched"),
    notes: () => v.array(v.note()).optional().desc("notes taken on it"),
  },
  examples: [{ id: "01a1b602-72dd-7350-a875-1dbc8aa490e4", role: "assistant", parts: [{ type: "tool_use", id: "call_Qr26DpMpmZgyI1o75tw2PkpT", name: "provision", input: { count: 3, set: [{ pick: "feed", limit: 10 }] } }], meta: { state: "tools", usage: { prompt_tokens: 6692, completion_tokens: 139, total_tokens: 6831, cost: 0.009755 }, provider: { finish_reason: "tool_calls", model: "openai/gpt-5.1" } }, parent: "1dd24f02-cb89-438e-96ac-45326f6ce48d", thread: "01a1b609-5607-741b-98df-9899bdc62e02", mode: "01a1b1c0-f0c1-7559-a38c-d59d34854a75" }],
};
