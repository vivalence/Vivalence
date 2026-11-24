import { v } from "../v.js";
import { ID } from "../scalars/index.js";

export const Start = v.null().desc("Carries nothing. Example: null");
export const Stop = v.null().desc("Carries nothing. Example: null");
export const Request = v.object({ method: v.string().optional(), path: v.string().optional() }).desc('The request a span answers. Example: { "method": "POST", "path": "/cortex/hallucinate" }');
export const Response = v.object({ status: v.integer().optional() }).desc('The answer a span sent; no status on a cancel. Example: { "status": 404 }');
export const Fault = v.object({ type: v.string(), message: v.string(), code: v.string().optional(), stack: v.string().optional() }).desc('What a thrown Error is. Example: { "type": "ConnectionError", "message": "refused", "code": "REFUSED" }');
export const Log = v.union([v.string(), v.object({}, { additionalProperties: true })]).desc('A line or any object. Example: "seated on probe"');
export const Entity = v.object({ schema: v.string(), id: ID }).desc('The row a span touched. Example: { "schema": "thread", "id": "42" }');
export const Status = v.object({ code: v.string() }, { additionalProperties: true }).desc('A status as its owner holds it. Example: { "code": "STOPPED" }');

export const Measure = v
  .object(
    {
      name: v.string().desc("What is measured.").example("output"),
      unit: v.string().desc("What it is measured in.").example("tokens"),
      amount: v.number().desc("How much, since the subject was asked.").example(139),
      channel: v.string().optional().desc("The channel that carried it.").example("text"),
      by: v.string().optional().desc("Who measured.").example("openrouter"),
    },
    { additionalProperties: false },
  )
  .desc("One measurement.");

export const Limit = v
  .object(
    {
      name: v.string().desc("The measure it bounds.").example("input"),
      unit: v.string().desc("What the quota is counted in.").example("tokens"),
      quota: v.number().desc("How much one window allows.").example(450000),
      window: v.number().optional().desc("The window, in seconds.").example(60),
      remaining: v.number().optional().desc("What is left of this window.").example(443129),
      reset: v.number().optional().desc("Seconds until the window resets.").example(12),
      by: v.string().optional().desc("Who enforces it.").example("openrouter"),
    },
    { additionalProperties: false },
  )
  .desc("One quota and where it stands.");

export const Usage = v
  .object(
    {
      subject: v
        .record(v.string(), v.union([v.string(), v.number()]))
        .desc("Who used it, as the keys a reader groups by."),
      state: v.string().optional().desc("How it closed; absent while it runs.").example("complete"),
      measures: v.array(Measure).desc("Every measurement since the subject was asked."),
      limits: v.array(Limit).optional().desc("The quotas the provider reported with this call."),
    },
    { additionalProperties: false },
  )
  .desc("What a subject used so far; it carries a state once it closed.");

export const Track = v
  .enum(["start", "stop", "request", "response", "fault", "log", "entity", "status", "usage"])
  .desc("The nine tracks a span can write; a span grafts usage itself.")
  .example("fault");
