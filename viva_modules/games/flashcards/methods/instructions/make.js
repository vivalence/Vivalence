import Mustache from "npm:mustache";

const verbFlashcards = (mask, { data, ...unit }) => {
  const { person, number, tense } = data.annotation;
  // TODO: maybe include the related PRONOUN?
  const frontFooter = `${tense} - ${person} Person ${number}`;
  const maskData = {
    front: {
      footer: `<h5>${frontFooter}</h5>`,
    },
  };
  return flashcard(mask, { data, ...unit }, maskData);
};

const nounFlashcards = (mask, { data, ...unit }) => {
  const { gender, number } = data.annotation;
  const article = ["fem"].includes(gender) ? "La " : "El ";
  const frontFooter = [gender, number].filter((f) => f).join(" - ");

  const maskData = {
    front: {
      footer: `<h5>${frontFooter}</h5>`,
    },
    back: {
      header: `<h2>${article}${data.spanish}<h2>`,
    },
  };

  return flashcard(mask, { data, ...unit }, maskData);
};
const flashcard = (mask, { data, ...unit }, maskData = {}) => {
  maskData = {
    front: {
      header: `<h2>${data.english}<h2>`,
      content: data.usageInEnglish ? `<p>${data.usageInEnglish}<p>` : "",
      ...(maskData.front || {}),
    },
    back: {
      header: `<h2>${data.spanish}<h2>`,
      content: data.usageInSpanish ? `<p>${data.usageInSpanish}<p>` : "",
      ...(maskData.back || {}),
    },
  };

  return {
    front: Mustache.render(mask["front"], maskData),
    back: Mustache.render(mask["back"], maskData),
  };
};

export default function make({ game, unit }) {
  let maker;
  if (["verb", "aux"].includes(unit.data.annotation.pos)) maker = verbFlashcards;
  else if (["noun"].includes(unit.data.annotation.pos)) maker = nounFlashcards;
  else maker = flashcard;

  return maker(game.data, unit);
}
