import { shard, Vector } from "@vivalence/typology";

export const ATTACHED = (mode) => {
  mode.attachment = new Vector().use(shard.context.bind("mode", mode)).graft(mode.module.attachment);
};
