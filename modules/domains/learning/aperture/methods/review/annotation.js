// import { validateSignal } from "../../memory/index.js";

export default async function ({ annotation, scope, signal }, ctx) {
  const issues = await ctx.runtime.assert //
    .annotation(annotation, ["SCHEMATIC", "EXISTENTIAL"]);
  if (issues.length > 0) return { issues, status: "error", message: "invalid" };

  const options = { fields: ["id"] };
  const unit = await ctx.runtime.entities.unit.findOne({ annotation }, options);
  const tags = await Promise.all(
    Object.entries(annotation).map(async ([branch, leaf]) => {
      const data = { ONTOLOGICAL: { branch, leaf } };
      return await ctx.runtime.entities.tag.findOne({ data }, options);
    }),
  );

  scope.unit = { id: unit.id };
  scope.tags = tags.map((tag) => ({ id: tag.id }));

  return await ctx.runtime.call("/review/scope", { signal, scope });
}
