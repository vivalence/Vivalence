import { v } from "@vivalence/typology";

export const { Runtime, Daemon, Service, Mode, Mask } = v.primitives.instance;

export const Instance = v.object({ runtime: v.object({}, { additionalProperties: true }) }, { additionalProperties: true });
