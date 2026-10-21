import { v } from "../v.js";

export const Start = v.null().desc("Carries nothing. Example: null");
export const Stop = v.null().desc("Carries nothing. Example: null");
export const Request = v.object({ method: v.string().optional(), path: v.string().optional() }).desc('The request a span answers. Example: { "method": "POST", "path": "/cortex/hallucinate" }');
export const Response = v.object({ status: v.integer().optional() }).desc('The answer a span sent; no status on a cancel. Example: { "status": 404 }');
export const Fault = v.object({ type: v.string(), message: v.string(), code: v.string().optional(), stack: v.string().optional() }).desc('What a thrown Error is. Example: { "type": "ConnectionError", "message": "refused", "code": "REFUSED" }');
export const Log = v.union([v.string(), v.object({}, { additionalProperties: true })]).desc('A line or any object. Example: "seated on probe"');
export const Entity = v.object({ schema: v.string(), id: v.string() }).desc('The row a span touched. Example: { "schema": "thread", "id": "42" }');
export const Status = v.object({ code: v.string() }, { additionalProperties: true }).desc('A status as its owner holds it. Example: { "code": "STOPPED" }');
