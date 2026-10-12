import { v } from "@vivalence/typology";

export const FLAGS = v.object({
  json: v.boolean().desc("the effect as json on stdout").optional(),
  help: v.boolean().desc("the nature's params and valence instead of running it").optional(),
  verbose: v.boolean().desc("the stack behind a failure, not just its one line").optional(),
  env: v.string().desc("<path>").examples("./environment/.env").optional(),
});
