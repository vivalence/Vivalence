import Mustache from "mustache";

const verbFlashcards = (mask, { data, ...unit }) => {
    const { Person, Number, Tense } = data.ud.feats;
    // TODO: maybe include the related PRONOUN?
    const frontFooter = `${Tense} - ${Person} Person ${Number}`;
    const maskData = {
        front: {
            footer: `<h5>${frontFooter}</h5>`
        }
    };
    return flashcard(mask, { data, ...unit }, maskData);
};

const nounFlashcards = (mask, { data, ...unit }) => {
    const { Gender, Number } = data.ud.feats;
    const article = ["Fem", "Feminine"].includes(Gender) ? "La " : "El ";
    const frontFooter = [Gender, Number].filter((f) => f).join(" - ");

    const maskData = {
        front: {
            footer: `<h5>${frontFooter}</h5>`
        },
        back: {
            header: `<h2>${article}${data.spanish}<h2>`
        }
    };

    return flashcard(mask, { data, ...unit }, maskData);
};
const flashcard = (mask, { data, ...unit }, maskData = {}) => {
    maskData = {
        front: {
            header: `<h2>${data.english}<h2>`,
            content: data.usageInEnglish ? `<p>${data.usageInEnglish}<p>` : "",
            ...(maskData.front || {})
        },
        back: {
            header: `<h2>${data.spanish}<h2>`,
            content: data.usageInSpanish ? `<p>${data.usageInSpanish}<p>` : "",
            ...(maskData.back || {})
        }
    };

    return {
        front: Mustache.render(mask["front"], maskData),
        back: Mustache.render(mask["back"], maskData)
    };
};

export default function make({ game, unit }) {
    let maker;
    if (["VERB", "AUX"].includes(unit.data.ud.upos)) maker = verbFlashcards;
    else if (["NOUN"].includes(unit.data.ud.upos)) maker = nounFlashcards;
    else maker = flashcard;
    // TODO: DEFAULT

    return maker(game.data, unit);
}
