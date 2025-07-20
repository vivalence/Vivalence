import { Type } from "@sinclair/typebox";
import { obj } from "@vivalence/shared";
import { annotation, unit, tag } from "./schema/index.js";
import { signal } from "../../memory/schema.js";

// scope
// blacklist
export default async function boot(runtime) {
  runtime.schema = obj.deepMerge(runtime.schema, {
    annotation,
    unit,
    tag,
    signal,
    annotations: {},
    units: {},
    statics: {
      language: Type.Object({ known: Type.String(), learning: Type.String() }),
    },
  });

  return runtime;
}
