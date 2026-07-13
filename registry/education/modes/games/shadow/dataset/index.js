export default {
  intent: [{
    slug: "feed",
    name: "Shadow",
    traits: ["MASKED", "AIMED", "QUEUEING"],
    trait: {
      MASKED: { batch: 3 },
      AIMED: { mount: "/emit/feed" },
      QUEUEING: { depth: 1 },
    },
  }],
};
