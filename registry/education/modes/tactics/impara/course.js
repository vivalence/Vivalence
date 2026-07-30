export const buckets = [
  {
    name: "Vocabolario",
    description: "Parole per frequenza, ripasso prima",
    traits: ["LABELED", "MASKED", "AIMED", "QUEUEING"],
    trait: {
      LABELED: {
        name: "Vocabolario",
        description: "Parole per frequenza, ripasso prima",
      },
      MASKED: { where: { symbols: ["word"], rank: { $gt: 0 } }, limit: 12 },
      AIMED: { mount: "/emit/vocabolario" },
      QUEUEING: { depth: 3 },
    },
  },
  {
    name: "Grammatica",
    description: "Paradigmi di coniugazione, essere e avere per primi",
    traits: ["LABELED", "MASKED", "AIMED", "QUEUEING"],
    trait: {
      LABELED: {
        name: "Grammatica",
        description: "Paradigmi di coniugazione, essere e avere per primi",
      },
      MASKED: { where: { symbols: ["conjugation"] }, limit: 3 },
      AIMED: { mount: "/emit/grammatica" },
      QUEUEING: { depth: 2 },
    },
  },
  {
    name: "Frasi",
    description: "Frasi intere, ascolto quando registrate",
    traits: ["LABELED", "MASKED", "AIMED", "QUEUEING"],
    trait: {
      LABELED: {
        name: "Frasi",
        description: "Frasi intere, ascolto quando registrate",
      },
      MASKED: { where: { symbols: ["sentence"] }, limit: 6 },
      AIMED: { mount: "/emit/frasi" },
      QUEUEING: { depth: 3 },
    },
  },
];
