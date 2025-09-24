// import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import { Aperture } from "@vivalence/vector/aperture";
import { Path } from "@vivalence/typology";
// import { bundler } from "@vivalence/shared";
import { agent } from "./aperture/index.js";
import dataset from "./dataset/index.js";
// import sessioned from "./session/index.js";
// import generator from "./session/index.js";

const manifest = {
  type: "agent", // sydney?
  slug: "eva",
  name: "Eva",
  version: "0.0.1",
  description: "Virtual Assistant",
  traits: ["VIEWABLE", "SESSIONED", "VALENTIC", "GENERATOR"], //
};

// const bundleRoot = dirname(fromFileUrl(import.meta.url));
// const bundlePath = join(bundleRoot, "./view/viva.svelte.js");
// const bundle = bundler(bundlePath);

const view = new Path("/view/viva.svelte.js");

async function init(input, ctx) {
  const user = await ctx.identity.getUser();
  // const user = await ctx.runtime.services.identity.getUser();
  const session = ctx.runtime.entities.session.create({
    agent: "eva",
    user: user.id,
  });
  await ctx.runtime.entities.em.flush();
  // steal past sessions exercises;
  return session;
}

async function feed(input, ctx) {
  // console.log("feed", input);
  // console.log("feed", ctx);
  // if (session.exercises.length > 0) return exercieses.map(e=>({view:e(view),state:e(state)}))
  return [{ agent: "welcome user" }];
}

// const aperture = new Aperture().open("/agent", agent);
const aperture = (v) => v.open("/agent", agent);
const session = (v) => v.open("/init", init);
const generate = (v) => v.open("/feed", feed); // maybe define input
// export const valences = [new Valence({ resolves: "/feed" })];
// const sessioned = {init: (input, ctx) => {return ctx.runtime.entities.session.create();},};

export default { manifest, view, aperture, session, generate, dataset };
