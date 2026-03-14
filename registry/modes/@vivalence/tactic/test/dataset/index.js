// import schema from "./schema.json" with { type: "json" };
// import entities from "./entities.json" with { type: "json" };

export default {
  // schema,
  entities: {
    valence: [
      {
        slug: "test",
        name: "Test",
        description: "",
        type: "SELFEVIDENT",
        traits: ["PRODUCTIVE"],
        data: {
          PRODUCTIVE: {
            mount: "/generate/introduction",
            queue: 1,
            mask: {
              batch: 1,
              stock: 1,
              seek: {
                symbols: ["sentence", "proficiency.survival"],
              },
            },
          },
        },
      },
    ],
  },
};
