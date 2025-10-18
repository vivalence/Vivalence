export const node = {
  slug: "nametype",
  name: "name type",
  description: "Semantic classification of proper nouns and names.",
  traits: ["CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "giv",
        name: "Given name",
        description: "Personal first names",
      },
      {
        slug: "sur",
        name: "Surname",
        description: "Family names or surnames",
      },
      {
        slug: "geo",
        name: "Geographic",
        description: "Place names, geographical locations",
      },
      {
        slug: "lit",
        name: "Literary",
        description: "Titles of books, works, texts",
      },
      {
        slug: "rel",
        name: "Religious",
        description: "Religious or mythological names",
      },
      {
        slug: "nat",
        name: "Ethnic/National",
        description: "Names referring to peoples or nations",
      },
    ],
  },
};
