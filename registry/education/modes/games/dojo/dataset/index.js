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
    rep("meet", "Meet", "/emit/meet/feed", { count: 8 }),
    rep("recognize", "Recognize", "/emit/recognize/feed", { count: 8 }),
    rep("write", "Write", "/emit/write/feed", { count: 3 }),
    rep("shadow", "Shadow", "/emit/shadow/feed", { count: 3 }, 2),
    rep("listen", "Listen", "/emit/listen/feed", { count: 3 }),
    rep("drill", "Drill", "/emit/drill/feed", { count: 4 }),
    rep("mixed", "Mixed", "/emit/mixed/feed", { count: 6 }),
    rep("conjugate", "Conjugate", "/emit/conjugations", { count: 2, gameplay: "CONJUGATE", recall: "LEARNING" }),
    rep("translate", "Translate", "/emit/generate", { count: 4, gameplay: "TYPE", recall: "KNOWN" }),
    rep("ultra", "Ultra", "/emit/feed", {
      count: 8,
      streak: 3,
      continuous: true,
      limit: { seconds: 600 },
    }),
  ],
};
