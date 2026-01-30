import { helper } from "@mikro-orm/core";

async function required(issue, ctx) {
  const { daemon } = ctx;
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
        branch: constraint.branch || null,
        leaf:
          constraint.leaf || literal.annotation?.[constraint.branch] || null,
      },
    },
  };

  const symbolIssues = await daemon.validate.symbol(symbolQuery, [
    "EXISTENTIAL",
  ]);

  if (symbolIssues.length > 0) {
    return issue.spawn(symbolIssues);
  }

  const symbol = await daemon.entities.symbol.findOne(symbolQuery);

  if (!symbol) {
    return issue.onError({
      message: "Symbol not found after existence check passed",
      symbolQuery,
    });
  }

  if (!helper(literal))
    literal = await ctx.daemon.entities.literal.findOne(literal);

  symbol.literals.add(literal);

  try {
    await daemon.entities.em.flush();
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
  violation: "required",
  path: ["literal", "symbols"],
};
