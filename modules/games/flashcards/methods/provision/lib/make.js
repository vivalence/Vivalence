import Mustache from "mustache";

const verbFlashcards = (mask, unit) => {
  // const { person, number, tense } = unit.annotation;
  // TODO: maybe include the related PRONOUN?

  const maskData = {
    front: {
      // footer: `${tense} - ${person} Person ${number}`,
    },
  };
  return flashcard(mask, unit, maskData);
};

const nounFlashcards = (mask, unit) => {
  // const { gender, number } = unit.annotation;
  // const article = ["fem"].includes(gender) ? "La" : "El";

  const maskData = {
    front: {
      // footer: [{ masc: "Masculine", fem: "Feminine" }[gender]].filter((f) => f).join(" - "),
    },
    back: {
      // header: `${article} ${unit.data.learning}`,
    },
  };

  return flashcard(mask, unit, maskData);
};

const flashcard = (mask, unit, maskData = {}) => {
  maskData = {
    front: {
      header: unit.data.known,
      content: unit.data.example?.known && `<i>${unit.data.example?.known}</i>`,
      footer: null,
      ...(maskData.front || {}),
    },
    back: {
      header: unit.data.learning,
      content:
        unit.data.example?.learning && `<i>${unit.data.example?.learning}</i>`,
      footer: null,
      ...(maskData.back || {}),
    },
  };

  return maskData;
  // return {front: Mustache.render(mask["front"], maskData), back: Mustache.render(mask["back"], maskData),};
};

export default function make({ mask, unit }) {
  let maker;
  if (["verb", "aux"].includes(unit.annotation.pos)) maker = verbFlashcards;
  else if (["noun"].includes(unit.annotation.pos)) maker = nounFlashcards;
  else maker = flashcard;

  return maker(mask, unit);
}
