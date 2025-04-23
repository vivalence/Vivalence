export default async function (body, ctx) {
  let operation = null;

  let condition = await ctx.runtime.entities.condition.findOne({
    slug: input.condition.slug,
    runtime: ctx.runtime.entity.id,
  });

  if (!condition) {
    condition = await ctx.runtime.entities.condition.create(input.condition);
    operation = "create";
  } else {
    condition = wrap(condition).assign(input.condition);
    operation = "update";
  }

  return { condition, operation };
}
