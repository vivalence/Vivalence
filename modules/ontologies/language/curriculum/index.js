// import tags from "./data/tags.js";
import annotations from "../topology/annotations/index.js";

const curriculum = { tags: [] };

Object.values(annotations).forEach(({ node }) => {
  if (node.traits.includes("CATEGORICAL")) {
    node.data.CATEGORICAL.map((category) => {
      curriculum.tags.push({
        name: `${node.name} - ${category.name}`,
        slug: `${node.slug}:${category.slug}`,
        description: `${category.description}`,
        data: { ONTOLOGICAL: { branch: node.slug, leaf: category.slug } },
        traits: ["ONTOLOGICAL"],
      });
    });
  }
});

export default curriculum;
