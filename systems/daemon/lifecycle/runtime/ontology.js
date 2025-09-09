import { Feature } from "@vivalence/shared/classifier";
import { obj, validators } from "@vivalence/shared";

export function ontology(rme) {
  const { instance, register } = rme;
  const ontology = instance.ontology;

  for (const topology of [
    register.ontology.topology,
    ...register.topic.map((t) => t.topology),
  ]) {
    if (topology.dimensions)
      topology.dimensions //
        .map((d) => ontology.dimension.create(d));

    if (topology.topographies) {
      topology.topographies //
        .map((t) => ontology.topography.create(t));
    }

    if (topology.constraints)
      topology.constraints //
        .map((c) => ontology.constraint.create(c));

    if (topology.remedies)
      topology.remedies.map((r) => ontology.medic.register(r));

    if (topology.receptors) {
      topology.receptors.entries().forEach(([form, parsers]) => {
        parsers.map((parser) => ontology.taxonomist.on(form, parser));
      });
    }
  }
}

export function constraints(rme) {
  const runtime = rme.instance;

  for (const dimension of runtime.ontology.dimension.topographical) {
    const topography = runtime.ontology.topography.findOne(dimension);
    if (!topography) continue;
    schematicConstraint(topography, runtime);
  }

  if (rme.register.domain.lifecycle.constraints)
    rme.register.domain.lifecycle.constraints(rme.instance);
}

function schematicConstraint(topography, runtime) {
  let validator = null;
  const schema = runtime.schema.annotations[topography.slug];

  runtime.ontology.constraint.create({
    branch: ["annotation", topography.slug],
    traits: ["SCHEMATIC"],
    predicate: async (annotation) => {
      if (!validator) validator = validators.viva.precompiled(schema);

      const issues = await validator(annotation);
      return issues.map((issue) => {
        issue.path.unshift("annotation");
        issue.context["annotation"] = annotation;
        return issue;
      });
    },
  });
}

export function taxonomist(rme) {
  const runtime = rme.instance;
  const ctx = {
    ontology: runtime.ontology,
    schema: runtime.schema,
    validate: runtime.validate,
    assert: runtime.assert,
    services: runtime.services,
    entities: runtime.entities,
  };

  runtime.classify = runtime.ontology.taxonomist
    .on(Feature, async (feature, ctx) => {
      let issues = await ctx.validate.annotation(
        feature.annotation, //
        ["SCHEMATIC", "EXISTENTIAL", "RELATIONAL"],
      );

      issues = issues.map((issue) => {
        issue.context.feature = feature;
        return issue;
      });

      issues = await ctx.ontology.remedy.many(issues, { runtime });

      if (issues.length > 0) {
        console.log("[@boot/ontology/classifier.js feature extraction error]");
        // console.log(issues);
        // console.log("/[classifier feature extraction error]");
        return null;
      }

      feature.unit = await ctx.entities.unit //
        .findOne({ annotation: feature.annotation }, { fields: ["id"] });

      return feature;
    })
    .factory(ctx);
}
// classifier on feature Feature {
//   token: {
//     index: 1,
//     token: "Salve",
//     lemma: "salo",
//     xpos: "L3|modC|tem1|gen5",
//     upos: "VERB",
//     feats: "Aspect=Imp|InflClass=LatX|Mood=Imp|Number=Sing|Person=2|Tense=Pres|VerbForm=Fin|Voice=Act",
//     start_char: 0,
//     end_char: 5
//   },
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
//     suffix: "lo"
//   },
//   signal: Token {
//     type: "token",
//     value: {
//       index: 1,
//       token: "Salve",
//       lemma: "salo",
//       xpos: "L3|modC|tem1|gen5",
//       upos: "VERB",
//       feats: "Aspect=Imp|InflClass=LatX|Mood=Imp|Number=Sing|Person=2|Tense=Pres|VerbForm=Fin|Voice=Act",
//       start_char: 0,
//       end_char: 5
//     },
//     ancestor: Text {
//       type: "text",
//       value: "Salve!",
//       ancestor: undefined,
//       generators: []
//     },
//     generators: [ [class Text extends Signal] ]
//   }
// }
// classifier on feature Feature {
//   token: {
//     index: 2,
//     token: "!",
//     lemma: "sum",
//     xpos: "F1|grn1|casA|gen1",
//     upos: "PRON",
//     feats: "Case=Nom|InflClass=LatAnom|Number=Sing|Person=2|PronType=Prs",
//     start_char: 5,
//     end_char: 6
//   },
//   annotation: {
//     lemma: "sum",
//     pos: "pron",
//     case: "nom",
//     inflclass: "latanom",
//     number: "sing",
//     person: "2",
//     prontype: "prs"
//   },
//   signal: Token {
//     type: "token",
//     value: {
//       index: 2,
//       token: "!",
//       lemma: "sum",
//       xpos: "F1|grn1|casA|gen1",
//       upos: "PRON",
//       feats: "Case=Nom|InflClass=LatAnom|Number=Sing|Person=2|PronType=Prs",
//       start_char: 5,
//       end_char: 6
//     },
//     ancestor: Text {
//       type: "text",
//       value: "Salve!",
//       ancestor: undefined,
//       generators: []
//     },
//     generators: [ [class Text extends Signal] ]
//   }
// }
