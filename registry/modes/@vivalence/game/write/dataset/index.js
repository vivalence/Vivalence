// import schema from "./schema.json" with { type: "json" };
// import entities from "./entities.json" with { type: "json" };

export default {
  // schema,
  entities: {
    valence: [
      {
        slug: "survival-words",
        name: "survival writing",
        description: "",
        type: "SELFEVIDENT",
        traits: ["BUFFERED"],
        data: {
          BUFFERED: {
            recall: "LEARNING",
            seek: {
              symbols: ["sentence", "proficiency.survival"],
            },
          },
        },
      },
    ],
  },
};
