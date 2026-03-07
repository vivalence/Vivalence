import { object } from "@vivalence/shared";

export function from(literals, scope) {
  return literals.map((literal) => ({
    data: make(literal),
    scope: object.merge(scope, { literals: [literal.id] }),
  }));
}

export function make(literal) {
  let maker;
  if (["verb", "aux"].includes(literal.annotation.pos)) maker = verbFlashcards;
  else if (["noun"].includes(literal.annotation.pos)) maker = nounFlashcards;
  else maker = basicFlashcard;

  return maker(literal);
}

function basicFlashcard(literal, maskData = {}) {
  maskData = {
    front: {
      header: literal.translated.known,
      content: literal.example.known && `<i>${literal.example.known}</i>`,
      footer: null,
      ...(maskData.front || {}),
    },
    back: {
      header: literal.translated.learning,
      content: literal.example?.learning && `<i>${literal.example?.learning}</i>`,
      footer: null,
      ...(maskData.back || {}),
    },
  };

  return maskData;
  // return {front: Mustache.render(mask["front"], maskData), back: Mustache.render(mask["back"], maskData),};
}

const verbFlashcards = (literal) => {
  // const { person, number, tense } = literal.annotation;
  // TODO: maybe include the related PRONOUN?

  const maskData = {
    front: {
      // footer: `${tense} - ${person} Person ${number}`,
    },
  };
  return basicFlashcard(literal, maskData);
};

const nounFlashcards = (literal) => {
  // const { gender, number } = literal.annotation;
  // const article = ["fem"].includes(gender) ? "La" : "El";

  const maskData = {
    front: {
      // footer: [{ masc: "Masculine", fem: "Feminine" }[gender]].filter((f) => f).join(" - "),
    },
    back: {
      // header: `${article} ${literal.data.learning}`,
    },
  };

  return basicFlashcard(literal, maskData);
};
