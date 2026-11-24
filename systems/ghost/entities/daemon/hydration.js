import { computed } from "nanostores";
import { Path, Vector } from "@vivalence/typology";

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.reference = new Path(`/daemon/${ctx.entity.slug}`);
  ctx.entity.connection = ctx.runtime.connection.branch(ctx.entity.reference.absolute);
  ctx.entity.aperture = ctx.entity.connection;
  ctx.entity.$files = computed([ctx.runtime.entities.mode.$entities, ctx.runtime.entities.file.$entities], (modes, files) =>
    files.filter((file) => file.daemon === ctx.entity || modes.filter((mode) => mode.daemon === ctx.entity).includes(file.mode)),
  );
});
