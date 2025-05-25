import entities from "./entities/index.js";

import bootHelper from "./modules/boot/index.js";
import installHelper from "./modules/install/index.js";

import hooks from "./hooks/index.js";
import events from "./events/index.js";
import aperture from "./aperture/index.js";

async function boot(runtime) {
  aperture.boot(runtime);
  events.boot(runtime);

  runtime.modules.tactics = {};
  runtime.modules.games = {};

  bootHelper.runtime(runtime);
  bootHelper.ontology(runtime);
  bootHelper.corpora(runtime);
  bootHelper.tactics(runtime);
  bootHelper.games(runtime);

  // await runtime.valences.create({slug: "spanish-session", literal: `start a spanish learning session by: 1. pulling available session[] from 'tools/entities/session/findAll' 2. identity the sessions slug 3. resolve to a ResolutionType of SESSION `,});
}

async function install(module, runtime) {
  console.log("install");
  // if (module.manifest.traits.includes("TOPOLOGICAL"))
  //   await installHelper.topology(module, runtime);
  // if (module.manifest.traits.includes("CURRICULAR"))
  //   await installHelper.curriculum(module, runtime);

  await test(runtime);
  return runtime;
}

async function test(runtime) {
  const unit = await runtime.entities.unit //
    .findOne({ annotation: Test.annotation }, { populate: [] });

  const issues = await runtime.ontology.assert.unit(unit);
  // console.log("[TEST EXISTANCE ASSERTION] issue", issues);

  // if (issue) {
  //   // issue.data.context.token = Test.token;
  //   // issue.data.context.signal = Test.signal;
  //   const remedy = await runtime.ontology.remedy.apply(issue, { runtime });
  //   console.log("[TEST EXISTANCE REMEDY] remedy", remedy);

  //   // const asserter = ctx.runtime.ontology.assert.unit;
  //   // const issues = await ctx.runtime.ontology.remedy.factory({ entity: unit, asserter, processors: input.processors }, ctx,);
  // }
}

const Test = {
  annotation: {
    lemma: "salo",
    pos: "verb",
    aspect: "imp",
    inflclass: "latx",
    mood: "imp",
    number: "sing",
    person: "2",
    tense: "pres",
    verbform: "fin",
    voice: "act",
  },
  // const issue = await runtime.ontology.assert.existance.unit({annotation:Test.annotation});
  // issue.data.context.token = Test.token;
  // issue.data.context.signal = Test.signal;
  // token: {index: 1, token: "Salve", lemma: "salo", xpos: "L3|modC|tem1|gen5", upos: "VERB", feats: "Aspect=Imp|InflClass=LatX|Mood=Imp|Number=Sing|Person=2|Tense=Pres|VerbForm=Fin|Voice=Act", start_char: 0, end_char: 5,}, signal: {type: "token", value: {index: 1, token: "Salve", lemma: "salo", xpos: "L3|modC|tem1|gen5", upos: "VERB", feats: "Aspect=Imp|InflClass=LatX|Mood=Imp|Number=Sing|Person=2|Tense=Pres|VerbForm=Fin|Voice=Act", start_char: 0, end_char: 5,}, ancestor: {type: "text", value: "Salve!", ancestor: undefined,},},
};

const manifest = {
  type: "domain",
  slug: "learning",
  name: "Learning",
  description: "Domain for learning with units tags ebisu and annotations",
  version: "0.0.5",
};

export { manifest, entities, boot, install, hooks };
