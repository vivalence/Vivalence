export default async function getUnitsByAnnotation({ annotation }, ctx) {
  return await ctx.runtime.entities.unit.findOne({ annotation });
}
