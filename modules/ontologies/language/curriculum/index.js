// import tags from "./data/tags.js";
import annotations from "../topology/annotations/index.js";

const curriculum = { tags: [] };

annotations.forEach((entity) => {
  if (entity.traits.includes("CATEGORICAL")) {
    entity.data.CATEGORICAL.map((category) => {
      curriculum.tags.push({
        name: `${entity.name} - ${category.name}`,
        slug: `${entity.slug}:${category.slug}`,
        description: `${category.description}`,
        data: { ONTOLOGICAL: { branch: entity.slug, leaf: category.slug } },
        traits: ["ONTOLOGICAL"],
      });
    });
  }
});

export default curriculum;
