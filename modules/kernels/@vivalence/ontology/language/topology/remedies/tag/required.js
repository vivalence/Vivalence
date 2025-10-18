async function required(issue, ctx) {
  const { config, ontology, schema } = ctx.runtime;

  const { ONTOLOGICAL } = issue.context.tag.data;
  const branch = ontology.dimension.findOne({ slug: ONTOLOGICAL.branch });
  if (!branch) return issue.onError({ messsage: "invalid ontology" });

  const leaf = branch.data?.CATEGORICAL?.find(
    (dim) => dim.slug === ONTOLOGICAL.leaf,
  );

  let tag = {
    slug: `${ONTOLOGICAL.branch}:${ONTOLOGICAL.leaf}`,
    traits: ["ONTOLOGICAL"],
    data: { ONTOLOGICAL },
    name: branch.name,
    description: branch.description,
  };

  if (leaf) {
    tag.name = `Ontological Leaf: ${branch.name} > ${leaf.name}`;
    tag.description = leaf.description;

    if (leaf.traits?.includes("LEARNABLE")) {
      tag.traits.push("LEARNABLE");
      tag.data.LEARNABLE = leaf.data.LEARNABLE;
    }
  } else {
    tag.name = `Ontological Branch: ${ONTOLOGICAL.branch} > *`;
    tag.slug = `${ONTOLOGICAL.branch}:*`;

    if (branch.traits?.includes("LEARNABLE")) {
      tag.traits.push("LEARNABLE");
      tag.data.LEARNABLE = branch.data.LEARNABLE;
    }
  }

  if (branch.slug === "lemma") {
    tag.name = `Lemma: ${ONTOLOGICAL.leaf}`;
    tag.slug = `${ONTOLOGICAL.branch}:${ONTOLOGICAL.leaf}`;
  }
  //

  const installation = await ctx.runtime.call("/tag/install", { tag });
  // console.log("/tag/install", installation);
  if (installation.status === "success") return await issue.resolve();
  return issue.onError({ message: "installation fail", tag, installation });
}

export default {
  handler: required,
  violation: "required",
  path: ["tag"],
};
