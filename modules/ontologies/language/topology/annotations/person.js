export const rule = {
  slug: "person",
  type: "string",
  title: "Person",
  description:
    "The grammatical person of a verb, indicating the subject. Possible values: '1' (First Person: The speaker or writer), '2' (Second Person: The person being addressed), '3' (Third Person: The person or thing being talked about).",
  enum: ["1", "2", "3"],
};
// export const meta = {slug: "person", enums: {1: { enum: "1", title: "First Person", description: "The speaker or writer." }, 2: { enum: "2", title: "Second Person", description: "The person being addressed." }, 3: {enum: "3", title: "Third Person", description: "The person or thing being talked about.",},},};
export const node = {
  slug: "person",
  name: "person",
  description: "The grammatical person of a verb, indicating the subject.",
  traits: ["CATEGORICAL", "CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "1",
        name: "First Person",
        description: "The speaker or writer",
      },
      {
        slug: "2",
        name: "Second Person",
        description: "The person being addressed",
      },
      {
        slug: "3",
        name: "Third Person",
        description: "The person or thing being talked about",
      },
    ],
  },
};
