import { v } from "@vivalence/typology";

export const { RuntimeMask, DaemonMask, ServiceMask, ModeMask, Mask } = v.primitives.instance;

export const Instance = v.object({ runtime: v.object({}, { additionalProperties: true }) }, { additionalProperties: true });
