async function required(issue, ctx) {
  const { daemon } = ctx;
  const { literal, relation } = issue.context;

  if (!literal) {
    return issue.onError({ message: "Missing literal in context" });
  }

  // Initialize symbols collection if needed
  if (!literal.symbols?.isInitialized?.()) {
    await literal.symbols?.init?.();
  }

  const constraint = relation?.required;
  if (!constraint) {
    return issue.onError({ message: "Missing required constraint" });
  }

  // Build query for the required symbol
  const symbolQuery = {
    data: {
      ONTOLOGICAL: {
        branch: constraint.branch || null,
        leaf: constraint.leaf || literal.annotation?.[constraint.branch] || null,
      },
    },
  };

  // Check if symbol exists
  const symbolIssues = await daemon.validate.symbol(symbolQuery, ["EXISTENTIAL"]);
  
  if (symbolIssues.length > 0) {
    // Symbol doesn't exist, spawn issues for it to be created
    return issue.spawn(symbolIssues);
  }

  // Find the symbol
  const symbol = await daemon.entities.symbol.findOne(symbolQuery);

  if (!symbol) {
    return issue.onError({ 
      message: "Symbol not found after existence check passed",
      symbolQuery 
    });
  }

  // Add symbol to literal
  literal.symbols.add(symbol);

  try {
    await daemon.entities.em.flush();
    return issue.resolve();
  } catch (err) {
    return issue.onError({ 
      message: "Failed to add symbol to literal", 
      error: err 
    });
  }
}

export default {
  handler: required,
  violation: "required",
  path: ["literal", "symbols"],
};
