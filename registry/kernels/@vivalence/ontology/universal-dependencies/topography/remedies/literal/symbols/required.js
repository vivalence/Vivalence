import { helper } from "@mikro-orm/core";

async function required(issue, ctx) {
  let { literal, relation } = issue.context;

  if (!literal) {
    return issue.onError({ message: "Missing literal in context" });
  }

  const constraint = relation?.required;
  if (!constraint) {
    return issue.onError({ message: "Missing required constraint" });
  }

  const symbolQuery = {
    data: {
      ONTOLOGICAL: {
        branch: constraint.branch || null, // leads to * branch wrongfully assigned.
        leaf: constraint.leaf || literal.annotation?.[constraint.branch] || null,
      },
    },
  };

  const symbolIssues = await ctx.daemon.validate //
    .symbol(symbolQuery, ["EXISTENTIAL"]);

  if (symbolIssues.length > 0) {
    return issue.spawn(symbolIssues);
  }

  const symbol = await ctx.daemon.entities.symbol.findOne(symbolQuery);

  if (!symbol) {
    return issue.onError({
      message: "Symbol not found after existence check passed",
      symbolQuery,
    });
  }

  if (!helper(literal)) {
    const literalQuery = {};
    if (literal.id) literalQuery.id = literal.id;
    if (literal.slug) literalQuery.slug = literal.slug;
    if (literal.annotation) literalQuery.annotation = literal.annotation;
    literal = await ctx.daemon.entities.literal.findOne(literalQuery);
  }

  symbol.literals.add(literal);

  try {
    await ctx.daemon.entities.em.flush();
    return issue.resolve();
  } catch (err) {
    return issue.onError({
      message: "Failed to add symbol to literal",
      error: err,
    });
  }
}

export default {
  handler: required,
  target: "literal",
  scope: ["symbols"],
  violation: "required",
};

// export default {
//   handler: required,
//   violation: "required",
//   path: ["literal", "symbols"],
// };
