import paladin from "@vivalence/paladin";
import { gestalten } from "@vivalence/runtime";
import { Vector } from "@vivalence/typology";

export const tools = new Vector()
  .graft(gestalten.tools.thread, gestalten.tools.entity, gestalten.tools.buffer)
  .graft(gestalten.tools.modes, gestalten.tools.tool)
  .graft(paladin.tools.fs, paladin.tools.shell);
