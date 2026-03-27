export default {
  intent: [{
    slug: "feed",
    name: "Shadow",
    type: "APPLICATIVE",
    traits: ["FEEDING"],
    trait: {
      FEEDING: {
        mount: "/emit/feed",
        queue: 1,
        mask: { batch: 3 },
      },
    },
  }],
};
