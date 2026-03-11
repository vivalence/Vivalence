export const words = [
  { slug: "dia.noun", known: "day", learning: "dia", rank: 51, pos: "noun", gender: "masculine" },
  { slug: "ano.noun", known: "year", learning: "ano", rank: 99, pos: "noun", gender: "masculine" },
  { slug: "casa.noun", known: "house / home", learning: "casa", rank: 91, pos: "noun", gender: "feminine" },
  { slug: "cidade.noun", known: "city", learning: "cidade", rank: 124, pos: "noun", gender: "feminine" },
  { slug: "trabalho.noun", known: "work / job", learning: "trabalho", rank: 131, pos: "noun", gender: "masculine" },
  { slug: "nome.noun", known: "name", learning: "nome", rank: 153, pos: "noun", gender: "masculine" },
  { slug: "família.noun", known: "family", learning: "família", rank: 272, pos: "noun", gender: "feminine" },
  { slug: "lugar.noun", known: "place", learning: "lugar", rank: 263, pos: "noun", gender: "masculine" },
  { slug: "mundo.noun", known: "world", learning: "mundo", rank: 81, pos: "noun", gender: "masculine" },
  { slug: "vida.noun", known: "life", learning: "vida", rank: 85, pos: "noun", gender: "feminine" },
  { slug: "tempo.noun", known: "time / weather", learning: "tempo", rank: 84, pos: "noun", gender: "masculine" },
  { slug: "pessoa.noun", known: "person", learning: "pessoa", rank: 285, pos: "noun", gender: "feminine" },
  { slug: "bom.adj", known: "good", learning: "bom", rank: 96, pos: "adjective" },
  { slug: "grande.adj", known: "big / great", learning: "grande", rank: 100, pos: "adjective" },
  { slug: "novo.adj", known: "new / young", learning: "novo", rank: 136, pos: "adjective" },
  { slug: "feliz.adj", known: "happy", learning: "feliz", rank: 405, pos: "adjective" },
  { slug: "triste.adj", known: "sad", learning: "triste", rank: 556, pos: "adjective" },
  { slug: "fácil.adj", known: "easy", learning: "fácil", rank: 385, pos: "adjective" },
  { slug: "difícil.adj", known: "difficult", learning: "difícil", rank: 404, pos: "adjective" },
  { slug: "forte.adj", known: "strong", learning: "forte", rank: 386, pos: "adjective" },
];

export const sentences = [
  {
    slug: "tudo-bem-tudo-bom",
    known: "How's it going? All good.",
    learning: "Tudo bem? Tudo bom.",
    level: "a1",
    tokens: [
      { form: "Tudo", gloss: "everything", deprel: "nsubj" },
      { form: "bem", gloss: "well", deprel: "root" },
      { form: "Tudo", gloss: "everything", deprel: "nsubj" },
      { form: "bom", gloss: "good", deprel: "parataxis" },
    ],
  },
  {
    slug: "que-legal",
    known: "How cool! That's great!",
    learning: "Que legal!",
    level: "a1",
    tokens: [
      { form: "Que", gloss: "how", deprel: "advmod" },
      { form: "legal", gloss: "cool", deprel: "root" },
    ],
  },
  {
    slug: "vou-te-ligar-amanha",
    known: "I'll call you tomorrow.",
    learning: "Vou te ligar amanhã.",
    level: "a2",
    tokens: [
      { form: "Vou", gloss: "I'm going to", deprel: "aux" },
      { form: "te", gloss: "you", deprel: "obj" },
      { form: "ligar", gloss: "call", deprel: "root" },
      { form: "amanhã", gloss: "tomorrow", deprel: "advmod" },
    ],
  },
  {
    slug: "vai-chover-hoje",
    known: "It's going to rain today.",
    learning: "Vai chover hoje.",
    level: "a2",
    tokens: [
      { form: "Vai", gloss: "is going to", deprel: "aux" },
      { form: "chover", gloss: "rain", deprel: "root" },
      { form: "hoje", gloss: "today", deprel: "advmod" },
    ],
  },
  {
    slug: "vou-dar-um-jeito",
    known: "I'll figure it out.",
    learning: "Vou dar um jeito.",
    level: "a2",
    tokens: [
      { form: "Vou", gloss: "I'm going to", deprel: "aux" },
      { form: "dar", gloss: "give", deprel: "root" },
      { form: "um", gloss: "a", deprel: "det" },
      { form: "jeito", gloss: "way", deprel: "obj" },
    ],
  },
  {
    slug: "pode-deixar",
    known: "Leave it to me.",
    learning: "Pode deixar.",
    level: "a1",
    tokens: [
      { form: "Pode", gloss: "can", deprel: "root" },
      { form: "deixar", gloss: "leave it", deprel: "xcomp" },
    ],
  },
  {
    slug: "ta-legal",
    known: "That's fine. Sounds good.",
    learning: "Tá legal.",
    level: "a1",
    tokens: [
      { form: "Tá", gloss: "is", deprel: "cop" },
      { form: "legal", gloss: "fine", deprel: "root" },
    ],
  },
  {
    slug: "deixa-eu-ver",
    known: "Let me see.",
    learning: "Deixa eu ver.",
    level: "a1",
    tokens: [
      { form: "Deixa", gloss: "let", deprel: "root" },
      { form: "eu", gloss: "me", deprel: "nsubj" },
      { form: "ver", gloss: "see", deprel: "xcomp" },
    ],
  },
  {
    slug: "quanto-custa-isso",
    known: "How much does this cost?",
    learning: "Quanto custa isso?",
    level: "a1",
    tokens: [
      { form: "Quanto", gloss: "how much", deprel: "advmod" },
      { form: "custa", gloss: "costs", deprel: "root" },
      { form: "isso", gloss: "this", deprel: "nsubj" },
    ],
  },
  {
    slug: "good-morning-how-are-you",
    known: "Good morning, how are you?",
    learning: "Bom dia, como você está?",
    level: "a1",
    tokens: [
      { form: "Bom", gloss: "good", deprel: "amod" },
      { form: "dia", gloss: "day", deprel: "root" },
      { form: "como", gloss: "how", deprel: "advmod" },
      { form: "você", gloss: "you", deprel: "nsubj" },
      { form: "está", gloss: "are", deprel: "parataxis" },
    ],
  },
  {
    slug: "goodbye-see-you-tomorrow",
    known: "Goodbye, see you tomorrow!",
    learning: "Tchau, até amanhã!",
    level: "a1",
    tokens: [
      { form: "Tchau", gloss: "bye", deprel: "root" },
      { form: "até", gloss: "until", deprel: "case" },
      { form: "amanhã", gloss: "tomorrow", deprel: "obl" },
    ],
  },
  {
    slug: "sorry-i-dont-understand",
    known: "Sorry, I don't understand.",
    learning: "Desculpa, eu não entendo.",
    level: "a1",
    tokens: [
      { form: "Desculpa", gloss: "sorry", deprel: "discourse" },
      { form: "eu", gloss: "I", deprel: "nsubj" },
      { form: "não", gloss: "not", deprel: "advmod" },
      { form: "entendo", gloss: "understand", deprel: "root" },
    ],
  },
  {
    slug: "espero-que-voce-esteja-bem",
    known: "I hope you are well.",
    learning: "Espero que você esteja bem.",
    level: "b1",
    tokens: [
      { form: "Espero", gloss: "I hope", deprel: "root" },
      { form: "que", gloss: "that", deprel: "mark" },
      { form: "você", gloss: "you", deprel: "nsubj" },
      { form: "esteja", gloss: "are", deprel: "ccomp" },
      { form: "bem", gloss: "well", deprel: "advmod" },
    ],
  },
];

export const clozeItems = [
  {
    slug: "cloze-eu-me-chamo",
    known: "My name is Finn.",
    learning: "Eu me chamo Finn.",
    tokens: ["Eu", "me", "chamo", "Finn"],
    gapIndex: 1,
    gapGloss: "myself (reflexive)",
    options: ["me", "te", "se", "nos"],
  },
  {
    slug: "cloze-ela-se-casou",
    known: "She got married last year.",
    learning: "Ela se casou ano passado.",
    tokens: ["Ela", "se", "casou", "ano", "passado"],
    gapIndex: 1,
    gapGloss: "herself (reflexive)",
    options: ["se", "me", "te", "lhe"],
  },
  {
    slug: "cloze-voce-quer-ajude",
    known: "Do you want me to help you?",
    learning: "Você quer que eu te ajude?",
    tokens: ["Você", "quer", "que", "eu", "te", "ajude"],
    gapIndex: 5,
    gapGloss: "help (subjunctive)",
    options: ["ajude", "ajudo", "ajudar", "ajuda"],
  },
  {
    slug: "cloze-o-livro",
    known: "The book I bought is very good.",
    learning: "O livro que eu comprei é muito bom.",
    tokens: ["O", "livro", "que", "eu", "comprei", "é", "muito", "bom"],
    gapIndex: 0,
    gapGloss: "the (masc. article)",
    options: ["O", "A", "Um", "Uma"],
  },
  {
    slug: "cloze-acho-que-vai",
    known: "I think it's going to rain.",
    learning: "Acho que vai chover.",
    tokens: ["Acho", "que", "vai", "chover"],
    gapIndex: 2,
    gapGloss: "is going to (3rd sing.)",
    options: ["vai", "vou", "vamos", "vão"],
  },
  {
    slug: "cloze-nao-se-preocupa",
    known: "Don't worry.",
    learning: "Não se preocupa.",
    tokens: ["Não", "se", "preocupa"],
    gapIndex: 1,
    gapGloss: "oneself (reflexive)",
    options: ["se", "me", "te", "nos"],
  },
  {
    slug: "cloze-espero-esteja",
    known: "I hope you are well.",
    learning: "Espero que você esteja bem.",
    tokens: ["Espero", "que", "você", "esteja", "bem"],
    gapIndex: 3,
    gapGloss: "are (subjunctive)",
    options: ["esteja", "está", "estar", "estou"],
  },
  {
    slug: "cloze-minha-familia",
    known: "My family lives in the south.",
    learning: "Minha família mora no sul.",
    tokens: ["Minha", "família", "mora", "no", "sul"],
    gapIndex: 0,
    gapGloss: "my (fem.)",
    options: ["Minha", "Meu", "Sua", "Nossa"],
  },
];

export const matchGroups = [
  {
    slug: "match-present-ir",
    title: "ir — present tense",
    pairs: [
      { left: "eu", right: "vou" },
      { left: "você", right: "vai" },
      { left: "nós", right: "vamos" },
      { left: "eles", right: "vão" },
    ],
  },
  {
    slug: "match-present-ter",
    title: "ter — present tense",
    pairs: [
      { left: "eu", right: "tenho" },
      { left: "você", right: "tem" },
      { left: "nós", right: "temos" },
      { left: "eles", right: "têm" },
    ],
  },
  {
    slug: "match-present-ser",
    title: "ser — present tense",
    pairs: [
      { left: "eu", right: "sou" },
      { left: "você", right: "é" },
      { left: "nós", right: "somos" },
      { left: "eles", right: "são" },
    ],
  },
  {
    slug: "match-present-estar",
    title: "estar — present tense",
    pairs: [
      { left: "eu", right: "estou" },
      { left: "você", right: "está" },
      { left: "nós", right: "estamos" },
      { left: "eles", right: "estão" },
    ],
  },
  {
    slug: "match-pronouns-obj",
    title: "object pronouns",
    pairs: [
      { left: "eu →", right: "me" },
      { left: "você →", right: "te" },
      { left: "ele →", right: "o" },
      { left: "ela →", right: "a" },
    ],
  },
  {
    slug: "match-articles",
    title: "definite articles",
    pairs: [
      { left: "masc. sing.", right: "o" },
      { left: "fem. sing.", right: "a" },
      { left: "masc. plur.", right: "os" },
      { left: "fem. plur.", right: "as" },
    ],
  },
];

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const pick = (arr, n) => shuffle(arr).slice(0, n);
export const exclude = (arr, item) => arr.filter((x) => x.slug !== item.slug);
