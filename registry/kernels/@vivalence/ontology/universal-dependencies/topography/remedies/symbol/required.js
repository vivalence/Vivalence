async function required(issue, ctx) {
  const { daemon } = ctx;

  const query = extract(issue);
  if (!query?.slug) {
    return issue.onError({
      message: "Cannot extract symbol slug from context",
      context: issue.context,
    });
  }

  const existing = await daemon.entities.symbol.findOne({ slug: query.slug });
  if (existing) return issue.resolve();

  const symbol = await build(query, daemon);
  if (!symbol) {
    return issue.onError({ message: "Failed to build symbol", query });
  }

  try {
    await daemon.entities.symbol.create(symbol);
    await daemon.entities.em.flush();
    return issue.resolve();
  } catch (error) {
    console.error("[REMEDY ERROR] symbol:required");
    console.error(error);
    return issue.onError({ message: error.message, error, symbol });
  }
}

function extract(issue) {
  const { context } = issue;

  if (context.symbol?.slug) return context.symbol;

  if (context.query?.slug) return context.query;

  const ontological =
    context.symbol?.data?.ONTOLOGICAL ||
    context.query?.data?.ONTOLOGICAL ||
    context.ONTOLOGICAL ||
    extractFromPath(issue);

  if (ontological?.branch) {
    const { branch, leaf } = ontological;
    return {
      slug: leaf ? `${branch}.${leaf}` : `${branch}.*`,
      traits: ["ONTOLOGICAL"],
      data: { ONTOLOGICAL: ontological },
    };
  }

  return null;
}

function extractFromPath(issue) {
  const { path, context } = issue;

  if (context.branch && context.leaf) {
    return { branch: context.branch, leaf: context.leaf };
  }

  if (path?.length >= 2 && path[0] === "symbol") {
    return { branch: path[1], leaf: context.leaf };
  }

  return null;
}

async function build(query, daemon) {
  const traits = query.traits || [];
  const primary = traits[0];

  switch (primary) {
    case "ONTOLOGICAL":
      return await buildOntological(query, daemon);
    case "STRUCTURAL":
      return buildStructural(query);
    default:
      return buildPassthrough(query);
  }
}

function buildStructural(query) {
  if (!query.slug) return null;

  return {
    slug: query.slug,
    name: query.name || query.slug,
    description: query.description || "",
    traits: query.traits || ["STRUCTURAL"],
    data: query.data || { STRUCTURAL: {} },
  };
}

function buildPassthrough(query) {
  if (!query.slug) return null;

  return {
    slug: query.slug,
    name: query.name || query.slug,
    description: query.description || "",
    traits: query.traits || [],
    data: query.data || {},
  };
}

async function buildOntological(query, daemon) {
  const ontological = query.data?.ONTOLOGICAL;
  if (!ontological?.branch) return null;

  const { branch, leaf } = ontological;

  const dimension = await daemon.entities.dimension.findOne({
    slug: branch,
    ancestor: null,
  });

  if (!dimension) return null;

  await dimension.descendants?.init?.();

  const symbol = {
    slug: query.slug || (leaf ? `${branch}.${leaf}` : `${branch}.*`),
    traits: ["ONTOLOGICAL"],
    data: { ONTOLOGICAL: ontological },
  };

  const leafDimension = leaf
    ? dimension.descendants?.getItems?.()?.find((d) => d.slug === leaf)
    : null;

  if (leafDimension) {
    symbol.name = `${dimension.name || branch} > ${leafDimension.name || leaf}`;
    symbol.description = leafDimension.description || dimension.description;
  } else if (leaf) {
    symbol.name = branch === "lemma" ? `Lemma: ${leaf}` : `${dimension.name || branch}: ${leaf}`;
    symbol.description = dimension.description;
  } else {
    symbol.name = `${dimension.name || branch} (any)`;
    symbol.description = dimension.description;
  }

  return symbol;
}

export default {
  handler: required,
  target: "symbol",
  violation: "required",
};

// async function required(issue, ctx) {
//   const { daemon } = ctx;

//   // Extract ONTOLOGICAL data from various possible locations
//   const ontological =
//     issue.context.query?.data?.ONTOLOGICAL ||
//     issue.context.symbol?.data?.ONTOLOGICAL ||
//     issue.context.ONTOLOGICAL ||
//     extractFromPath(issue);

//   if (!ontological?.branch) {
//     return issue.onError({
//       message: "Cannot determine ontological branch for symbol",
//       context: issue.context,
//     });
//   }

//   const { branch, leaf } = ontological;

//   // Find the dimension for this branch
//   const dimension = await daemon.entities.dimension.findOne({
//     slug: branch,
//     ancestor: null,
//   });

//   if (!dimension) {
//     return issue.onError({
//       message: `Dimension not found: ${branch}`,
//     });
//   }

//   await dimension.descendants?.init?.();

//   // Build the symbol
//   let symbol = {
//     slug: leaf ? `${branch}.${leaf}` : `${branch}.*`,
//     traits: ["ONTOLOGICAL"],
//     data: { ONTOLOGICAL: ontological },
//   };

//   // Find the leaf dimension if specified
//   const leafDimension = leaf
//     ? dimension.descendants?.getItems?.()?.find((d) => d.slug === leaf)
//     : null;

//   // Set name and description based on dimension/leaf
//   if (leafDimension) {
//     symbol.name = `${dimension.name || branch} > ${leafDimension.name || leaf}`;
//     symbol.description = leafDimension.description || dimension.description;

//     // if (leafDimension.traits?.includes("LEARNABLE")) {symbol.traits.push("LEARNABLE"); if (leafDimension.data?.LEARNABLE) {symbol.data.LEARNABLE = leafDimension.data.LEARNABLE;}}
//   } else if (leaf) {
//     // Leaf specified but not found as dimension (e.g., lemma values)
//     symbol.name = `${dimension.name || branch}: ${leaf}`;
//     symbol.description = dimension.description;

//     if (branch === "lemma") {
//       symbol.name = `Lemma: ${leaf}`;
//     }
//   } else {
//     // Branch-only symbol (wildcard)
//     symbol.name = `${dimension.name || branch} (any)`;
//     symbol.description = dimension.description;

//     // if (dimension.traits?.includes("LEARNABLE")) {symbol.traits.push("LEARNABLE"); if (dimension.data?.LEARNABLE) {symbol.data.LEARNABLE = dimension.data.LEARNABLE;}}
//   }

//   try {
//     // Check if symbol already exists
//     const existing = await daemon.entities.symbol.findOne({
//       slug: symbol.slug,
//     });

//     if (existing) {
//       return issue.resolve();
//     }

//     // Create the symbol
//     await daemon.entities.symbol.create(symbol);
//     await daemon.entities.em.flush();

//     return issue.resolve();
//   } catch (error) {
//     console.error("[REMEDY ERROR] symbol:required");
//     console.error(error);
//     return issue.onError({
//       message: error.message,
//       error,
//       symbol,
//     });
//   }
// }

// function extractFromPath(issue) {
//   // Try to extract branch/leaf from issue path
//   // e.g., ["symbol", "lemma"] or context with branch/leaf
//   const { path, context } = issue;

//   if (context.branch && context.leaf) {
//     return { branch: context.branch, leaf: context.leaf };
//   }

//   if (path.length >= 2 && path[0] === "symbol") {
//     return { branch: path[1], leaf: context.leaf };
//   }

//   return null;
// }

// // export default {
// //   handler: required,
// //   violation: "required",
// //   path: ["symbol", "*"],
// // };

// export default {
//   handler: required,
//   target: "symbol",
//   violation: "required",
// };
