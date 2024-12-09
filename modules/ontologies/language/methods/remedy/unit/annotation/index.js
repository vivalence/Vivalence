import star from "./*.js";

async function duplication(issue, ctx) {
  const { annotation, units } = issue.context;

  // Helper function to count non-empty key-value pairs in an object
  const countNonEmptyPairs = (obj) =>
    Object.entries(obj).filter(
      ([_, value]) => value !== null && value !== undefined && value !== "",
    ).length;

  // Sort units based on quality criteria
  const sortedUnits = units.sort((a, b) => {
    const aExampleCount = countNonEmptyPairs(a.data.example || {});
    const bExampleCount = countNonEmptyPairs(b.data.example || {});

    if (aExampleCount !== bExampleCount) {
      return bExampleCount - aExampleCount; // More examples is better
    }

    if (typeof a.data.index === "number" && typeof b.data.index !== "number") return -1;
    if (
      typeof a.data.index === "number" &&
      typeof b.data.index === "number" &&
      a.data.index !== b.data.index
    )
      return a.data.index - b.data.index;

    // If example counts are the same, prefer shorter 'known' field
    return (a.data.known || "").length - (b.data.known || "").length;
  });

  const bestUnit = sortedUnits[0];
  const unitsToRemove = sortedUnits.slice(1);

  // Remove duplicate units
  for (const unit of unitsToRemove) {
    const { error } = await ctx.runtime.services.supabase.from("Unit").delete().eq("id", unit.id);
    if (error) {
      console.error(`Error removing unit ${unit.id}:`, error);
    }
  }

  return {
    resolved: true,
    action: "removed_duplicates",
    context: {
      keptUnit: bestUnit,
      removedUnits: unitsToRemove,
      annotation: annotation,
    },
  };
}
async function conditional(issue, locals) {
  return { resolved: false };
}

export default {
  handlers: { conditional, duplication },
  path: ["annotation"],
  children: [star],
};
