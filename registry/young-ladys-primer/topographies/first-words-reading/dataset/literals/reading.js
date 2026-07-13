export default [
  {
    slug: "reading.print-awareness",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Print carries meaning",
        description:
          "A book holds words, and words hold meaning. Print is read left to right, top to bottom, front to back.",
      },
      REQUIRES: { concepts: [] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.print-concepts" },
      { slug: "age.4-5" },
    ],
  },
  {
    slug: "reading.letter-shapes",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Letters have shapes and names",
        description: "Each letter of the alphabet has a shape to recognise and a name to call it by.",
      },
      REQUIRES: { concepts: ["reading.print-awareness"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.print-concepts" },
      { slug: "age.4-5" },
    ],
  },
  {
    slug: "reading.phoneme-awareness",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Words are made of sounds",
        description: "A spoken word can be broken into the separate small sounds that make it up.",
      },
      REQUIRES: { concepts: [] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.phonemic-awareness" },
      { slug: "age.4-5" },
    ],
  },
  {
    slug: "reading.rhyme",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Words can rhyme",
        description: "Words that end in the same sound rhyme — cat, hat, mat.",
      },
      REQUIRES: { concepts: ["reading.phoneme-awareness"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.phonemic-awareness" },
      { slug: "age.4-5" },
    ],
  },
  {
    slug: "reading.letter-sounds",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Letters stand for sounds",
        description: "Each letter stands for a sound — the letter m says /m/.",
      },
      REQUIRES: { concepts: ["reading.letter-shapes", "reading.phoneme-awareness"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.phonics" },
      { slug: "age.4-5" },
    ],
  },
  {
    slug: "reading.blending",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Blending sounds into a word",
        description: "Push the letter-sounds together in order to hear the word — /c/ /a/ /t/ makes cat.",
      },
      REQUIRES: { concepts: ["reading.letter-sounds"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.phonics" },
      { slug: "age.5-6" },
    ],
  },
  {
    slug: "reading.segmenting",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Segmenting a word into sounds",
        description: "Break a spoken word back into its sounds — cat is /c/ /a/ /t/. The mirror of blending.",
      },
      REQUIRES: { concepts: ["reading.letter-sounds"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.phonics" },
      { slug: "age.5-6" },
    ],
  },
  {
    slug: "reading.cvc-words",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Reading simple words",
        description: "Decode three-sound consonant-vowel-consonant words — cat, dog, sun, big.",
      },
      REQUIRES: { concepts: ["reading.blending", "reading.segmenting"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.word-reading" },
      { slug: "age.5-6" },
    ],
  },
  {
    slug: "reading.digraphs",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Two letters, one sound",
        description: "Some sounds are spelt with two letters — sh, ch, th, ck.",
      },
      REQUIRES: { concepts: ["reading.cvc-words"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.phonics" },
      { slug: "age.5-6" },
    ],
  },
  {
    slug: "reading.sight-words",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Words known on sight",
        description: "Common words that break the rules must be known by sight — the, said, was, you.",
      },
      REQUIRES: { concepts: ["reading.letter-sounds"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.word-reading" },
      { slug: "age.5-6" },
    ],
  },
  {
    slug: "reading.word-families",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Word families",
        description: "Words that share an ending read alike — cat, hat, bat, sat.",
      },
      REQUIRES: { concepts: ["reading.cvc-words", "reading.rhyme"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.word-reading" },
      { slug: "age.5-6" },
    ],
  },
  {
    slug: "reading.simple-sentences",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Reading a sentence",
        description: "String read words together into a whole short sentence — The cat sat on the mat.",
      },
      REQUIRES: { concepts: ["reading.cvc-words", "reading.sight-words"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.word-reading" },
      { slug: "age.6-7" },
    ],
  },
  {
    slug: "reading.fluency",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Reading smoothly",
        description: "Read sentences at a steady pace, with expression, no longer sounding out each word.",
      },
      REQUIRES: { concepts: ["reading.simple-sentences", "reading.word-families"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.comprehension" },
      { slug: "age.6-7" },
    ],
  },
  {
    slug: "reading.comprehension",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Understanding what is read",
        description: "Hold the meaning of a sentence in mind — who did what, where, and why.",
      },
      REQUIRES: { concepts: ["reading.simple-sentences"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.comprehension" },
      { slug: "age.6-7" },
    ],
  },
  {
    slug: "reading.retell",
    traits: ["LABELED", "REQUIRES"],
    trait: {
      LABELED: {
        name: "Retelling a story",
        description: "Say back what a story was about in one's own words, in the right order.",
      },
      REQUIRES: { concepts: ["reading.comprehension", "reading.fluency"] },
    },
    symbols: [
      { slug: "subject.english" },
      { slug: "strand.comprehension" },
      { slug: "age.6-7" },
    ],
  },
];
