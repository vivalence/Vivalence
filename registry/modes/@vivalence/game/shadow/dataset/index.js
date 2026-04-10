export default {
  intent: [{
    slug: "feed",
    name: "Shadow",
    traits: ["QUEUEING"],
    trait: {
      QUEUEING: {
        mount: "/emit/feed",
        queue: 1,
        mask: { batch: 3 },
      },
    },
  }],
};
