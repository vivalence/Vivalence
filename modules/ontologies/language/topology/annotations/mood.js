// export const rule = {slug: "mood", type: "string", title: "Mood", description: "The grammatical mood of a verb, indicating modality. Possible values: 'ind' (Indicative: A mood used for statements of fact), 'sub' (Subjunctive: A mood used for hypothetical or non-real actions), 'imp' (Imperative: A mood used for commands or requests), 'cnd' (Conditional: A mood used to express conditions or hypothetical situations).", enum: ["ind", "sub", "imp", "cnd"],};
// export const meta = {slug: "mood", enums: {ind: {enum: "ind", title: "Indicative", description: "A mood used for statements of fact.",}, sub: {enum: "sub", title: "Subjunctive", description: "A mood used for hypothetical or non-real actions.",}, imp: {enum: "imp", title: "Imperative", description: "A mood used for commands or requests.",}, cnd: {enum: "cnd", title: "Conditional", description: "A mood used to express conditions or hypothetical situations.",},},};

export const node = {
  slug: "mood",
  name: "mood",
  description: "The grammatical mood of a verb, indicating modality.",
  traits: ["CATEGORICAL", "CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "ind",
        name: "Indicative",
        description: "A mood used for statements of fact",
      },
      {
        slug: "sub",
        name: "Subjunctive",
        description: "A mood used for hypothetical or non-real actions",
      },
      {
        slug: "imp",
        name: "Imperative",
        description: "A mood used for commands or requests",
      },
      {
        slug: "cnd",
        name: "Conditional",
        description: "A mood used to express conditions or hypothetical situations",
      },
    ],
  },
};
