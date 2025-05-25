export const node = {
  slug: "voice",
  name: "voice",
  description:
    "Grammatical voice indicating the relationship between action and subject.",
  traits: ["CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "act",
        name: "Active",
        description: "Subject performs the action",
      },
      {
        slug: "pass",
        name: "Passive",
        description: "Subject receives the action",
      },
    ],
  },
};
