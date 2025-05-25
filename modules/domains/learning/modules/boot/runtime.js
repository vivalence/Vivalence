import { Type } from "@sinclair/typebox";
import { obj } from "@vivalence/shared";

export default function boot(runtime) {
  runtime.schema = obj.deepMerge(runtime.schema, {
    statics: {
      language: Type.Object({
        known: Type.String(),
        learning: Type.String(),
      }),
    },
  });
}
