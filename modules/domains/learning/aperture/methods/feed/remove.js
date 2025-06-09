export default async function (input, ctx) {
  const instruction = await ctx.runtime.entities.instruction.findOne({
    id: input.instruction.id,
  });
  if (instruction) {
    ctx.runtime.entities.em.remove(instruction);
    await ctx.runtime.entities.em.flush();
  }
  return { status: "success" };
}
