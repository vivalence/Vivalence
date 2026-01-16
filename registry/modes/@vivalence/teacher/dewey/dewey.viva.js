import { View } from "@vivalence/typology";
import { Aperture } from "@vivalence/vector/aperture";
import dataset from "./dataset/index.js";
import aperture from "./aperture/index.js";

const manifest = {
  type: "teacher",
  slug: "dewey",
  name: "Dewey Finn",
  version: "0.0.1",
  description: `Dewey Finn is the main protagonist of "School of Rock", a 2003 film directed by Richard Linklater starring Jack Black, Joan Cusack and Sarah Silverman. Dewey is a down-on-his-luck, energetic, 30-year-old wannabe rock superstar who is kicked out of his own band 'No Vacancy' due to his antics such as constant 20-minute solos and stage diving.`,
  traits: ["VIEWABLE", "DATASET", "VALENTIC", "CHAOSMONKEY"], // "SESSIONED", "GENERATOR",  // datamap?dataset?
};

const view = new View("/view/viva.svelte.js");

export { manifest, view, aperture, dataset };

// if (session.exercises.length > 0) return exercieses.map(e=>({view:e(view),state:e(state)}))
// const session = (v) => v.open("/init", init);
// const sessioned = {init: (input, ctx) => {return ctx.runtime.entities.session.create();},};
// steal past sessions exercises;
// async function init(input, ctx) {const user = await ctx.identity.getUser(); const session = ctx.runtime.entities.session.create({agent: "eva", user: user.id,}); await ctx.runtime.entities.em.flush(); return session;}
