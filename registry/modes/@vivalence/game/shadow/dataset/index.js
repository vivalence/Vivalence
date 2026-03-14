export default {
  entities: {
    valence: [
      {
        slug: "survival-shadow",
        name: "survival shadow",
        description: "",
        type: "SELFEVIDENT",
        traits: ["BUFFERED"],
        data: {
          BUFFERED: {
            recall: "LEARNING",
            speed: { rate: "SLOW" },
            seek: {
              symbols: ["sentence", "proficiency.survival"],
            },
          },
        },
      },
    ],
  },
};
