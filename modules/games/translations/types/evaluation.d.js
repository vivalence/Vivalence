const responses = [
  [
    {
      type: "Unit",
      id: "043a851a-45f0-4fd4-b45c-cbfce8d66d17",
      evaluation: {
        status: "UNKNOWN",
        correction: "El",
        feedback:
          "The article 'el' should be capitalized as 'El' to match the expected translation.",
      },
    },
    {
      type: "Tag",
      id: "d192bf8b-e0ce-41f5-a3e0-7bd86e44927b",
      evaluation: {
        status: "KNOWN",
      },
    },
    {
      type: "Tag",
      id: "82758521-b342-489f-8c33-7cecb6756cd2",
      evaluation: {
        status: "KNOWN",
      },
    },
    {
      type: "Tag",
      id: "274f0dd9-9f0d-45b2-92bb-d2bcdeca73ab",
      evaluation: {
        status: "KNOWN",
      },
    },
  ],
  [
    {
      type: "Unit",
      id: "aac99573-e056-4973-bae8-df9bb173ecb1",
      evaluation: {
        status: "KNOWN",
        correction: null,
        feedback: null,
      },
    },
    {
      type: "Tag",
      id: "d192bf8b-e0ce-41f5-a3e0-7bd86e44927b",
      evaluation: {
        status: "KNOWN",
      },
    },
    {
      type: "Tag",
      id: "274f0dd9-9f0d-45b2-92bb-d2bcdeca73ab",
      evaluation: {
        status: "KNOWN",
      },
    },
  ],
  [
    {
      type: "Unit",
      id: "1357cb6c-c7a1-4cff-beb7-e187f9f933ad",
      evaluation: {
        status: "UNKNOWN",
        correction: "está",
        feedback: "The word 'está' is missing in your translation.",
      },
    },
    {
      type: "Tag",
      id: "274f0dd9-9f0d-45b2-92bb-d2bcdeca73ab",
      evaluation: {
        status: "KNOWN",
      },
    },
  ],
  [
    {
      type: "Unit",
      id: "eb378c20-ef86-4cac-8e8f-c087f2d79a50",
      evaluation: {
        status: "UNKNOWN",
        correction: "en",
        feedback: "The word 'en' is missing from the user translation.",
      },
    },
  ],
  [
    {
      type: "Unit",
      id: "e6259d35-7351-4312-921b-3c9a3fb7dcfd",
      evaluation: {
        status: "KNOWN",
        correction: null,
        feedback: null,
      },
    },
    {
      type: "Tag",
      id: "0862498e-5a83-41a3-994a-9d00f638cf65",
      evaluation: {
        status: "KNOWN",
      },
    },
    {
      type: "Tag",
      id: "82758521-b342-489f-8c33-7cecb6756cd2",
      evaluation: {
        status: "KNOWN",
      },
    },
    {
      type: "Tag",
      id: "274f0dd9-9f0d-45b2-92bb-d2bcdeca73ab",
      evaluation: {
        status: "KNOWN",
      },
    },
  ],
  [
    {
      type: "Unit",
      id: "989b7dbd-e43f-4d76-825a-8e3da543f07a",
      evaluation: {
        status: "KNOWN",
        correction: null,
        feedback: null,
      },
    },
    {
      type: "Tag",
      id: "0862498e-5a83-41a3-994a-9d00f638cf65",
      evaluation: {
        status: "KNOWN",
      },
    },
    {
      type: "Tag",
      id: "274f0dd9-9f0d-45b2-92bb-d2bcdeca73ab",
      evaluation: {
        status: "KNOWN",
      },
    },
  ],
  [
    {
      type: "Unit",
      id: "fee35d8a-f8d3-492a-beca-d2d94244df31",
      evaluation: {
        status: "KNOWN",
        correction: null,
        feedback: null,
      },
    },
  ],
];

export default {
  data: [
    {
      type: "Unit",
      id: "043a851a-45f0-4fd4-b45c-cbfce8d66d17",
      evaluation: {
        status: "UNKNOWN",
        correction: "El",
        feedback:
          "The article 'el' should be capitalized as 'El' to match the expected translation.",
      },
      known: "the",
      index: 1,
      token: "El",
      start_char: 0,
      end_char: 2,
      tags: [
        {
          type: "Tag",
          id: "d192bf8b-e0ce-41f5-a3e0-7bd86e44927b",
          evaluation: {
            status: "KNOWN",
          },
          name: "Gender: Masculine",
          branch: "gender",
          leaf: "masc",
        },
        {
          type: "Tag",
          id: "82758521-b342-489f-8c33-7cecb6756cd2",
          evaluation: {
            status: "KNOWN",
          },
          name: "Definiteness: Definite",
          branch: "definite",
          leaf: "def",
        },
        {
          type: "Tag",
          id: "274f0dd9-9f0d-45b2-92bb-d2bcdeca73ab",
          evaluation: {
            status: "KNOWN",
          },
          name: "Number Singular",
          branch: "number",
          leaf: "sing",
        },
      ],
    },
    {
      type: "Unit",
      id: "aac99573-e056-4973-bae8-df9bb173ecb1",
      evaluation: {
        status: "KNOWN",
        correction: null,
        feedback: null,
      },
      known: "book",
      index: 2,
      token: "libro",
      start_char: 3,
      end_char: 8,
      tags: [
        {
          type: "Tag",
          id: "d192bf8b-e0ce-41f5-a3e0-7bd86e44927b",
          evaluation: {
            status: "KNOWN",
          },
          name: "Gender: Masculine",
          branch: "gender",
          leaf: "masc",
        },
        {
          type: "Tag",
          id: "274f0dd9-9f0d-45b2-92bb-d2bcdeca73ab",
          evaluation: {
            status: "KNOWN",
          },
          name: "Number Singular",
          branch: "number",
          leaf: "sing",
        },
      ],
    },
    {
      type: "Unit",
      id: "1357cb6c-c7a1-4cff-beb7-e187f9f933ad",
      evaluation: {
        status: "UNKNOWN",
        correction: "está",
        feedback: "The word 'está' is missing in your translation.",
      },
      known: "he/she/it is",
      index: 3,
      token: "está",
      start_char: 9,
      end_char: 13,
      tags: [
        {
          type: "Tag",
          id: "274f0dd9-9f0d-45b2-92bb-d2bcdeca73ab",
          evaluation: {
            status: "KNOWN",
          },
          name: "Number Singular",
          branch: "number",
          leaf: "sing",
        },
      ],
    },
    {
      type: "Unit",
      id: "eb378c20-ef86-4cac-8e8f-c087f2d79a50",
      evaluation: {
        status: "UNKNOWN",
        correction: "en",
        feedback: "The word 'en' is missing from the user translation.",
      },
      known: "in, on",
      index: 4,
      token: "en",
      start_char: 14,
      end_char: 16,
      tags: [],
    },
    {
      type: "Unit",
      id: "e6259d35-7351-4312-921b-3c9a3fb7dcfd",
      evaluation: {
        status: "KNOWN",
        correction: null,
        feedback: null,
      },
      known: "the",
      index: 5,
      token: "la",
      start_char: 17,
      end_char: 19,
      tags: [
        {
          type: "Tag",
          id: "0862498e-5a83-41a3-994a-9d00f638cf65",
          evaluation: {
            status: "KNOWN",
          },
          name: "Gender: Feminine",
          branch: "gender",
          leaf: "fem",
        },
        {
          type: "Tag",
          id: "82758521-b342-489f-8c33-7cecb6756cd2",
          evaluation: {
            status: "KNOWN",
          },
          name: "Definiteness: Definite",
          branch: "definite",
          leaf: "def",
        },
        {
          type: "Tag",
          id: "274f0dd9-9f0d-45b2-92bb-d2bcdeca73ab",
          evaluation: {
            status: "KNOWN",
          },
          name: "Number Singular",
          branch: "number",
          leaf: "sing",
        },
      ],
    },
    {
      type: "Unit",
      id: "989b7dbd-e43f-4d76-825a-8e3da543f07a",
      evaluation: {
        status: "KNOWN",
        correction: null,
        feedback: null,
      },
      known: "table, board",
      index: 6,
      token: "mesa",
      start_char: 20,
      end_char: 24,
      tags: [
        {
          type: "Tag",
          id: "0862498e-5a83-41a3-994a-9d00f638cf65",
          evaluation: {
            status: "KNOWN",
          },
          name: "Gender: Feminine",
          branch: "gender",
          leaf: "fem",
        },
        {
          type: "Tag",
          id: "274f0dd9-9f0d-45b2-92bb-d2bcdeca73ab",
          evaluation: {
            status: "KNOWN",
          },
          name: "Number Singular",
          branch: "number",
          leaf: "sing",
        },
      ],
    },
    {
      type: "Unit",
      id: "fee35d8a-f8d3-492a-beca-d2d94244df31",
      evaluation: {
        status: "KNOWN",
        correction: null,
        feedback: null,
      },
      known: "period",
      index: 7,
      token: ".",
      start_char: 24,
      end_char: 25,
      tags: [],
    },
  ],
};
