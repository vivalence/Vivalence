const rep = (slug, name, mount, masked, depth = 1) => ({
  slug,
  name,
  traits: ["MASKED", "AIMED", "QUEUEING"],
  trait: {
    MASKED: masked,
    AIMED: { mount },
    QUEUEING: { depth },
  },
});

export const dataset = {
  intent: [
    rep("write", "Write", "/emit/write/feed", { count: 3 }),
    rep("shadow", "Shadow", "/emit/shadow/feed", { count: 3 }, 2),
    rep("listen", "Listen", "/emit/listen/feed", { count: 3 }),
    rep("flashcard", "Flashcard", "/emit/flashcard/feed", { count: 5 }),
    rep("pick", "Pick", "/emit/pick/feed", { count: 4 }),
    rep("conjugate", "Conjugate", "/emit/conjugate/feed", { count: 2 }),
    rep("translate", "Translate", "/emit/translate/feed", { count: 4 }),
    rep("ultra", "Ultra", "/emit/feed", {
      count: 8,
      streak: 3,
      continuous: true,
      limit: { seconds: 600 },
    }),
  ],
};
