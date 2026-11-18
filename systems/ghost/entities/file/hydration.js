import { computed } from "nanostores";
import { Vector } from "@vivalence/typology";

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.$url = computed(ctx.runtime.lighthouse.$authority, () =>
    ctx.runtime.attached(`/file/${ctx.entity.id}`),
  );
});
