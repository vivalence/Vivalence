import Mustache from "npm:mustache";

const verbFlashcards = (mask, unit) => {
  const { person, number, tense } = unit.annotation;
  // TODO: maybe include the related PRONOUN?
  const frontFooter = `${tense} - ${person} Person ${number}`;
  const maskData = {
    front: {
      footer: `<h5>${frontFooter}</h5>`,
    },
  };
  return flashcard(mask, unit, maskData);
};

const nounFlashcards = (mask, unit) => {
  const { gender, number } = unit.annotation;
  const article = ["fem"].includes(gender) ? "La " : "El ";
  const frontFooter = [gender, number].filter((f) => f).join(" - ");

  const maskData = {
    front: {
      footer: `<h5>${frontFooter}</h5>`,
    },
    back: {
      header: `<h2>${article}${unit.data.learning}<h2>`,
    },
  };

  return flashcard(mask, unit, maskData);
};
const flashcard = (mask, unit, maskData = {}) => {
  maskData = {
    front: {
      header: `<h2>${unit.data.known}<h2>`,
      content: unit.data.example.known ? `<p>${unit.data.example.known}<p>` : "",
      ...(maskData.front || {}),
    },
    back: {
      header: `<h2>${unit.data.learning}<h2>`,
      content: unit.data.example.learning ? `<p>${unit.data.example.learning}<p>` : "",
      ...(maskData.back || {}),
    },
  };

  return {
    front: Mustache.render(mask["front"], maskData),
    back: Mustache.render(mask["back"], maskData),
  };
};

export default function make({ mask, unit }, runtime) {
  let maker;
  if (["verb", "aux"].includes(unit.annotation.pos)) maker = verbFlashcards;
  else if (["noun"].includes(unit.annotation.pos)) maker = nounFlashcards;
  else maker = flashcard;

  return maker(mask, unit);
}
