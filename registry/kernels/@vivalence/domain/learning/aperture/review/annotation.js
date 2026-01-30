export default async function ({ annotation, scope, signal }, ctx) {
  const issues = await ctx.daemon.assert
    .annotation(annotation, ["SCHEMATIC", "EXISTENTIAL"]);
  if (issues.length > 0) return { issues, status: "error", message: "invalid" };

  const options = { fields: ["id"] };
  const literal = await ctx.daemon.entities.literal.findOne({ annotation }, options);
  const symbols = await Promise.all(
    Object.entries(annotation).map(async ([branch, leaf]) => {
      const data = { ONTOLOGICAL: { branch, leaf } };
      return await ctx.daemon.entities.symbol.findOne({ data }, options);
    }),
  );

  scope.literal = { id: literal.id };
  scope.symbols = symbols.map((symbol) => ({ id: symbol.id }));

  return await ctx.daemon.call("/review/scope", { signal, scope });
}
