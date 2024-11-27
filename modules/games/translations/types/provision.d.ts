const provisioninput = {
  mask: {
    prompt: {
      goal: "\nYou're given an explanation of a grammatical concept, that includes examples.\nYour task is to extract an example sentence from the explanation.\nThe goal is for the user to translate that sentence for practice.\n\n1. Extract a sentence from the explanation that demonstrates the concept. \n2. Use simple, everyday vocabulary suitable for the learner's level.\n3. The sentence should be clear, concise, and make sense in conversation or writing.\n4. Ensure the sentence untilizes correct grammar and vocabulary.\n",
    },
  },
  scope: {
    dependency: {
      id: "34de578b-985b-44f1-81a0-6d2ca43ea72c",
    },
    tactic: {
      id: "71c4ed7d-1a4a-4017-a794-01267d601e4b",
    },
    user: {
      id: "02cc2c18-aece-4132-9863-225e8ae5dad2",
    },
    game: {
      id: "877e1133-477a-4739-9eea-f74676381fb8",
    },
  },
  constraints: [
    'The grammatical concept and examples are provided in this prose: "<p>In Spanish, nouns have a gender. This means that every noun is classified as either masculine or feminine. Understanding noun gender is important because it affects how we use adjectives and articles in sentences. For example, the word <strong>\\"libro\\"</strong> (book) is masculine, while <strong>\\"mesa\\"</strong> (table) is feminine.</p>\\n\\n<p>Here are some examples of masculine and feminine nouns:</p>\\n<ul>\\n  <li><strong>Masculine:</strong> <code>el perro</code> (the dog), <code>el coche</code> (the car), <code>el niño</code> (the boy)</li>\\n  <li><strong>Feminine:</strong> <code>la gata</code> (the female cat), <code>la casa</code> (the house), <code>la niña</code> (the girl)</li>\\n</ul>" ',
    "the sentence should be extracted from the prose examples.",
    "extract accurately, without adding vocabulary thats not in the prose. this is first contact.",
    "conceptual example: 'x es masculino.' or 'y es femenino.'",
    "limit the vocabulary to whats used in the prose.",
  ],
};
