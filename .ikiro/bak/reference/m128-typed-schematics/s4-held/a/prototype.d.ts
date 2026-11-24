import type { InstanceMask, Requirement } from "@vivalence/typology";

export interface Instance extends InstanceMask {}

export class Instance {
  paladin: {
    requirements: Requirement[];
    faults: string[];
    dormant: unknown[];
    inherited: string[];
  };

  client(slug: string): Instance["clients"][number];
}
