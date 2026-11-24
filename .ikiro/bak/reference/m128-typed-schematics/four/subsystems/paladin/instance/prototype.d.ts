import type { primitives } from "@vivalence/typology";

export interface Instance extends primitives.instance.InstanceMask {}

export class Instance {
  paladin: {
    requirements: primitives.instance.Requirement[];
    faults: string[];
    dormant: unknown[];
    inherited: string[];
  };

  client(slug: string): Instance["clients"][number];
}
