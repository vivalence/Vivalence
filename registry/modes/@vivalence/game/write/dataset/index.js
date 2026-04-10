export default {
  intent: [{
    slug: "feed",
    name: "Write",
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
