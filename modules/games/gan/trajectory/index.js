import provision from "./provision.js";
import generator from "./agents/generator.js";
import discriminator from "./agents/discriminator.js";
import librarian from "./agents/librarian.js";
// import trajectory from "./trajectory.js";

export default async function (runtime) {
  // game.aperture.open("/learnables", learnables);
  runtime.aperture.open("/librarian", librarian);
  runtime.aperture.open("/discriminator", discriminator);
  runtime.aperture.open("/generator", generator);
  runtime.aperture.open("/provision", provision);
}

// const data = {instruction: {learnables: {puella: "Latin noun meaning 'girl'", puer: "Latin noun meaning 'boy'", cantat: "Latin verb meaning 'sings/is singing'",}, process: [{ slug: "intro_noun", description: "Introduction to the noun 'puella'" }, { slug: "practice_noun", description: "Practice with puella" }, { slug: "intro_verb", description: "Introduction to the verb 'cantat'" }, { slug: "combine", description: "Creating first sentence" }, { slug: "comprehension", description: "Translation practice" }, { slug: "second_noun", description: "Introduction to 'puer'" }, { slug: "application", description: "Form second sentence" }, { slug: "assessment", description: "Final translation review" },],},};
