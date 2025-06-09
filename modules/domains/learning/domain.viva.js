import { enums } from "@vivalence/entities";
import { fn } from "@vivalence/shared";
import entities from "./entities/index.js";

import bootHelper from "./modules/boot/index.js";

import hooks from "./hooks/index.js";
import events from "./events/index.js";
import aperture from "./aperture/index.js";

async function boot(runtime) {
  await fn.reduce(
    [
      bootHelper.runtime,
      bootHelper.ontology,
      bootHelper.corpora,
      bootHelper.tactics,
      bootHelper.games,
      bootHelper.strategies,
      aperture.boot,
      events.boot,
    ],
    runtime,
  );
  // await runtime.valences.create({slug: "spanish-session", literal: `start a spanish learning session by: 1. pulling available session[] from 'tools/entities/session/findAll' 2. identity the sessions slug 3. resolve to a ResolutionType of SESSION `,});
  return runtime;
}

async function install(runtime, daemon) {
  // import installHelper from "./modules/install/index.js";
  // const modules = [runtime.config.modules.ontology, ...runtime.config.modules.corpora,].filter((module) => module.manifest.traits.includes("DATASET")); for (const module of modules) {const entity = runtime.entity.modules .filter((entity) => entity.type === module.manifest.type) .find((entity) => entity.slug === module.manifest.slug); if (entity.installed) continue; try {if (module.manifest.traits.includes("TOPOLOGICAL")) {await installHelper.topology(module, runtime);} if (module.manifest.traits.includes("CURRICULAR")) {await installHelper.curriculum(module, runtime);} entity.installation = enums.installation.INSTALLED;} catch (error) {entity.installation = enums.installation.FAULTY; console.log("[MODULE INSTALLATION ERROR]"); throw error;} finally {await daemon.entities.em.flush();}}

  const promises = [];
  for (const dimension of runtime.ontology.dimensions) {
    for (const category of dimension.descendants) {
      const tag = {
        data: {
          ONTOLOGICAL: {
            branch: dimension.slug,
            leaf: category.slug,
          },
        },
      };
      promises.push(runtime.assert.tag(tag, ["EXISTENTIAL"]));
    }
  }
  await Promise.all(promises);

  return runtime;
}

const manifest = {
  type: "domain",
  slug: "learning",
  name: "Learning",
  description: "Domain for learning with units tags ebisu and annotations",
  version: "0.0.5",
  traits: ["DATASET"],
};

export { manifest, entities, boot, install, hooks };

// async function test(runtime) {
//   const unit = await runtime.entities.unit //
//     .findOne({ annotation: Test.annotation }, { populate: [] });

//   // console.log("unit", unit);
//   // const issues = await runtime.validate.unit(unit);
//   // const issues = await runtime.assert.unit(unit);
//   // console.log("issues", issues);

//   // const constraints = ontology.constraints.branch([unit]).traits([relational]);
//   // const result = await ctx.runtime.ontology.remedy.factory({ constraints, entity: unit }, ctx,);
// }

// const Test = {
//   annotation: {
//     lemma: "salo",
//     pos: "verb",
//     aspect: "imp",
//     inflclass: "latx",
//     mood: "imp",
//     number: "sing",
//     person: "2",
//     tense: "pres",
//     verbform: "fin",
//     voice: "act",
//   },
//   // const issue = await runtime.ontology.assert.existance.unit({annotation:Test.annotation});
//   // issue.data.context.token = Test.token;
//   // issue.data.context.signal = Test.signal;
//   // token: {index: 1, token: "Salve", lemma: "salo", xpos: "L3|modC|tem1|gen5", upos: "VERB", feats: "Aspect=Imp|InflClass=LatX|Mood=Imp|Number=Sing|Person=2|Tense=Pres|VerbForm=Fin|Voice=Act", start_char: 0, end_char: 5,}, signal: {type: "token", value: {index: 1, token: "Salve", lemma: "salo", xpos: "L3|modC|tem1|gen5", upos: "VERB", feats: "Aspect=Imp|InflClass=LatX|Mood=Imp|Number=Sing|Person=2|Tense=Pres|VerbForm=Fin|Voice=Act", start_char: 0, end_char: 5,}, ancestor: {type: "text", value: "Salve!", ancestor: undefined,},},
// };
