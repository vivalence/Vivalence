export default {
  intent: [
    {
      slug: "verb-clinic-class",
      name: "Conjugation Patterns",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/class",
          queue: 0,
          mask: {
            where: { symbols: ["word.regularity.regular", "proficiency.survival"] },
          },
        },
      },
    },
    {
      slug: "verb-clinic-regularity",
      name: "Regular vs Irregular",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/regularity",
          queue: 0,
          mask: {
            where: { symbols: ["proficiency.survival"] },
          },
        },
      },
    },
  ],
};
