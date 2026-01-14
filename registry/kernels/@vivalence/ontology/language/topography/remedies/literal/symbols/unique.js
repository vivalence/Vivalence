async function unique(issue, ctx) {
  const { daemon } = ctx;
  const { literal, relation } = issue.context;

  if (!literal) {
    return issue.onError({ message: "Missing literal in context" });
  }

  const constraint = relation?.unique;
  if (!constraint) {
    return issue.onError({ message: "Missing unique constraint" });
  }

  // Initialize symbols if needed
  if (!literal.symbols?.isInitialized?.()) {
    await literal.symbols?.init?.();
  }

  const symbols = literal.symbols?.getItems?.() || [];

  // Find duplicate symbols matching the constraint
  const duplicates = symbols.filter((symbol) => {
    const ontological = symbol.data?.ONTOLOGICAL;
    if (!ontological) return false;

    const branchMatch = !constraint.branch || ontological.branch === constraint.branch;
    const leafMatch = !constraint.leaf || ontological.leaf === constraint.leaf;

    return branchMatch && leafMatch;
  });

  // Keep symbols that match the annotation, remove extras
  const toRemove = duplicates.filter((symbol) => {
    const ontological = symbol.data?.ONTOLOGICAL;
    if (!ontological) return true;

    // Keep if it matches the annotation
    const annotationValue = literal.annotation?.[ontological.branch];
    return annotationValue !== ontological.leaf;
  });

  // Remove duplicates beyond the first valid one
  if (duplicates.length > 1 && toRemove.length === 0) {
    // All match annotation, remove all but first
    toRemove.push(...duplicates.slice(1));
  }

  for (const symbol of toRemove) {
    literal.symbols.remove(symbol);
  }

  try {
    await daemon.entities.em.flush();
    return issue.resolve();
  } catch (err) {
    return issue.onError({ 
      message: "Failed to remove duplicate symbols", 
      error: err 
    });
  }
}

export default {
  handler: unique,
  violation: "unique",
  path: ["literal", "symbols"],
};
