import curriculum from "./curriculum.js";

export default async function topology({ topology }, runtime) {
  if (topology.annotations?.length > 0) {
    const tags = [];
    topology.annotations.forEach((entity) => {
      if (entity.traits.includes("CATEGORICAL")) {
        entity.data.CATEGORICAL.map((category) => {
          tags.push({
            slug: `${entity.slug}:${category.slug}`,
            name: `${entity.name} - ${category.name}`,
            description: `${category.description}`,
            data: { ONTOLOGICAL: { branch: entity.slug, leaf: category.slug } },
            traits: ["ONTOLOGICAL"],
          });
        });
      }
    });

    await curriculum({ curriculum: { tags } }, runtime);
  }
}
