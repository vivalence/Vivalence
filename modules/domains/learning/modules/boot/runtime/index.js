import config from "@vivalence/config";
import { Type } from "@sinclair/typebox";
import { obj } from "@vivalence/shared";
import { annotation, unit, tag } from "./schema/index.js";
import { signal } from "../../../memory/schema.js";

// scope
// blacklist
export default async function boot(runtime) {
  await ensureUser(runtime);

  runtime.schema = obj.deepMerge(runtime.schema, {
    annotation,
    unit,
    tag,
    signal,
    annotations: {},
    units: {},
    statics: {
      language: Type.Object({
        known: Type.String(),
        learning: Type.String(),
      }),
    },
  });

  return runtime;
}

async function ensureUser(runtime) {
  const count = await runtime.entities.user.count({
    id: config.identity.singleplayer.user.id,
  });
  if (count === 0) {
    await runtime.entities.user.create(config.identity.singleplayer.user);
    await runtime.entities.em.flush();
  }
}
