import { Aperture } from "@vivalence/vector/aperture";
import { Path } from "@vivalence/typology";
// import { agent } from "./aperture/index.js";
import dataset from "./dataset/index.js";

const manifest = {
  type: "agent",
  slug: "eva",
  name: "Eva",
  version: "0.0.1",
  description: "Virtual Assistant",
  traits: ["VIEWABLE", "DATASET", "VALENTIC"], // "SESSIONED", "GENERATOR",  // datamap?dataset?
};

const view = new Path("/view/viva.svelte.js");

const aperture = (v) => v; //.open("/agent", agent);

const generate = (v) =>
  v.open("/feed", (input, ctx) => [{ agent: "sheeeeet, what you want?" }]); // maybe define input

export default { manifest, view, aperture, generate, dataset };

// if (session.exercises.length > 0) return exercieses.map(e=>({view:e(view),state:e(state)}))
// const session = (v) => v.open("/init", init);
// const sessioned = {init: (input, ctx) => {return ctx.runtime.entities.session.create();},};
// steal past sessions exercises;
// async function init(input, ctx) {const user = await ctx.identity.getUser(); const session = ctx.runtime.entities.session.create({agent: "eva", user: user.id,}); await ctx.runtime.entities.em.flush(); return session;}
