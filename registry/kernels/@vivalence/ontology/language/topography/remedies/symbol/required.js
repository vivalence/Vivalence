async function required(issue, ctx) {
  const { daemon } = ctx;

  // Extract ONTOLOGICAL data from various possible locations
  const ontological =
    issue.context.query?.data?.ONTOLOGICAL ||
    issue.context.symbol?.data?.ONTOLOGICAL ||
    issue.context.ONTOLOGICAL ||
    extractFromPath(issue);

  if (!ontological?.branch) {
    return issue.onError({
      message: "Cannot determine ontological branch for symbol",
      context: issue.context,
    });
  }

  const { branch, leaf } = ontological;

  // Find the dimension for this branch
  const dimension = await daemon.entities.dimension.findOne({
    slug: branch,
    ancestor: null,
  });

  if (!dimension) {
    return issue.onError({
      message: `Dimension not found: ${branch}`,
    });
  }

  await dimension.descendants?.init?.();

  // Build the symbol
  let symbol = {
    slug: leaf ? `${branch}:${leaf}` : `${branch}:*`,
    traits: ["ONTOLOGICAL"],
    data: { ONTOLOGICAL: ontological },
  };

  // Find the leaf dimension if specified
  const leafDimension = leaf
    ? dimension.descendants?.getItems?.()?.find((d) => d.slug === leaf)
    : null;

  // Set name and description based on dimension/leaf
  if (leafDimension) {
    symbol.name = `${dimension.name || branch} > ${leafDimension.name || leaf}`;
    symbol.description = leafDimension.description || dimension.description;

    // Copy traits from leaf dimension
    if (leafDimension.traits?.includes("LEARNABLE")) {
      symbol.traits.push("LEARNABLE");
      if (leafDimension.data?.LEARNABLE) {
        symbol.data.LEARNABLE = leafDimension.data.LEARNABLE;
      }
    }
  } else if (leaf) {
    // Leaf specified but not found as dimension (e.g., lemma values)
    symbol.name = `${dimension.name || branch}: ${leaf}`;
    symbol.description = dimension.description;

    if (branch === "lemma") {
      symbol.name = `Lemma: ${leaf}`;
    }
  } else {
    // Branch-only symbol (wildcard)
    symbol.name = `${dimension.name || branch} (any)`;
    symbol.description = dimension.description;

    if (dimension.traits?.includes("LEARNABLE")) {
      symbol.traits.push("LEARNABLE");
      if (dimension.data?.LEARNABLE) {
        symbol.data.LEARNABLE = dimension.data.LEARNABLE;
      }
    }
  }

  try {
    // Check if symbol already exists
    const existing = await daemon.entities.symbol.findOne({
      slug: symbol.slug,
    });

    if (existing) {
      return issue.resolve();
    }

    // Create the symbol
    await daemon.entities.symbol.create(symbol);
    await daemon.entities.em.flush();

    return issue.resolve();
  } catch (error) {
    console.error("[REMEDY ERROR] symbol:required");
    console.error(error);
    return issue.onError({
      message: error.message,
      error,
      symbol,
    });
  }
}

function extractFromPath(issue) {
  // Try to extract branch/leaf from issue path
  // e.g., ["symbol", "lemma"] or context with branch/leaf
  const { path, context } = issue;

  if (context.branch && context.leaf) {
    return { branch: context.branch, leaf: context.leaf };
  }

  if (path.length >= 2 && path[0] === "symbol") {
    return { branch: path[1], leaf: context.leaf };
  }

  return null;
}

export default {
  handler: required,
  violation: "required",
  path: ["symbol", "*"],
};
