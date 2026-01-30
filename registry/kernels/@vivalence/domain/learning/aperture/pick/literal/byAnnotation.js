export default async function getLiteralsByAnnotation({ annotation }, ctx) {
  return await ctx.daemon.entities.literal.findOne({ annotation });
}
