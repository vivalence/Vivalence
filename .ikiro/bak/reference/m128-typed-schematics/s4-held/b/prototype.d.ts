import type { held } from "@vivalence/typology";

type InstanceMask = held["primitives"]["instance"]["InstanceMask"];

export interface Instance extends InstanceMask {}

export class Instance {
  paladin: {
    requirements: held["primitives"]["instance"]["Requirement"][];
    faults: string[];
    dormant: unknown[];
    inherited: string[];
  };

  client(slug: string): Instance["clients"][number];
}
