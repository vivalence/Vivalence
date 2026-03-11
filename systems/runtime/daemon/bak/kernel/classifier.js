import { Feature } from "@vivalence/typology";

export function classifier(daemonDie) {
  daemonDie.good.kernel.taxonomist.on(Feature, async (feature, ctx) => {
    console.log("[@daemon/kernel/classifier called on Feature");
    let issues = await daemonDie.good.validate.annotation(
      feature.annotation, //
      ["SCHEMATIC", "EXISTENTIAL", "RELATIONAL"],
    );

    issues = issues.map((issue) => {
      issue.context.feature = feature;
      return issue;
    });

    // issues = await daemonDie.good.kernel.remedy.many(issues, {daemon: daemonDie.good,});

    if (issues.length > 0) {
      console.log("[@daemon/kernel/classifier.js feature extraction error]");
      // console.log(issues);
      // console.log("/[classifier feature extraction error]");
      return null;
    }

    feature.literal = await ctx.entities.literal //
      .findOne({ annotation: feature.annotation }, { fields: ["id"] });

    return feature;
  });

  for (const kernelmode of daemonDie.register.kernel) {
    if (kernelmode.topography?.taxonomy) {
      kernelmode.topography.taxonomy.map(([form, handler]) => {
        daemonDie.good.kernel.taxonomist.on(form, handler);
      });
    }
  }
  const ctx = {
    // ontology: daemonDie.good.ontology,
    schema: daemonDie.good.schema,
    validate: daemonDie.good.validate,
    assert: daemonDie.good.assert,
    services: daemonDie.good.services,
  };

  for (const Form of daemonDie.good.kernel.taxonomist.forms) {
    daemonDie.good.classify[Form.name.toLowerCase()] = async (classifiable) => {
      return await daemonDie.good.kernel.taxonomist //
        .parse(new Form(classifiable), ctx);
    };
  }
  // console.log("daemonDie.good.classify ", daemonDie.good.classify);
}

// import { Feature } from "@vivalence/shared/classifier";

// export default function classifierFactory(runtime) {
//   const ctx = {
//     ontology: runtime.ontology,
//     schema: runtime.schema,
//     validate: runtime.validate,
//     assert: runtime.assert,
//     services: runtime.services,
//     entities: runtime.entities,
//   };

//   runtime.classify = runtime.ontology.classifier
//     .on(Feature, async (feature, ctx) => {
//       let issues = await ctx.validate.annotation(
//         feature.annotation, //
//         ["SCHEMATIC", "EXISTENTIAL", "RELATIONAL"],
//       );

//       issues = issues.map((issue) => {
//         issue.context.feature = feature;
//         return issue;
//       });

//       issues = await ctx.ontology.remedy.many(issues, { runtime });

//       if (issues.length > 0) {
//         console.log("[@boot/ontology/classifier.js feature extraction error]");
//         // console.log(issues);
//         // console.log("/[classifier feature extraction error]");
//         return null;
//       }

//       feature.unit = await ctx.entities.unit //
//         .findOne({ annotation: feature.annotation }, { fields: ["id"] });

//       return feature;
//     })
//     .factory(ctx);

//   return runtime;
// }
// // classifier on feature Feature {
// //   token: {
// //     index: 1,
// //     token: "Salve",
// //     lemma: "salo",
// //     xpos: "L3|modC|tem1|gen5",
// //     upos: "VERB",
// //     feats: "Aspect=Imp|InflClass=LatX|Mood=Imp|Number=Sing|Person=2|Tense=Pres|VerbForm=Fin|Voice=Act",
// //     start_char: 0,
// //     end_char: 5
// //   },
// //   annotation: {
// //     lemma: "salo",
// //     pos: "verb",
// //     aspect: "imp",
// //     inflclass: "latx",
// //     mood: "imp",
// //     number: "sing",
// //     person: "2",
// //     tense: "pres",
// //     verbform: "fin",
// //     voice: "act",
// //     suffix: "lo"
// //   },
// //   signal: Token {
// //     type: "token",
// //     value: {
// //       index: 1,
// //       token: "Salve",
// //       lemma: "salo",
// //       xpos: "L3|modC|tem1|gen5",
// //       upos: "VERB",
// //       feats: "Aspect=Imp|InflClass=LatX|Mood=Imp|Number=Sing|Person=2|Tense=Pres|VerbForm=Fin|Voice=Act",
// //       start_char: 0,
// //       end_char: 5
// //     },
// //     ancestor: Text {
// //       type: "text",
// //       value: "Salve!",
// //       ancestor: undefined,
// //       generators: []
// //     },
// //     generators: [ [class Text extends Signal] ]
// //   }
// // }
// // classifier on feature Feature {
// //   token: {
// //     index: 2,
// //     token: "!",
// //     lemma: "sum",
// //     xpos: "F1|grn1|casA|gen1",
// //     upos: "PRON",
// //     feats: "Case=Nom|InflClass=LatAnom|Number=Sing|Person=2|PronType=Prs",
// //     start_char: 5,
// //     end_char: 6
// //   },
// //   annotation: {
// //     lemma: "sum",
// //     pos: "pron",
// //     case: "nom",
// //     inflclass: "latanom",
// //     number: "sing",
// //     person: "2",
// //     prontype: "prs"
// //   },
// //   signal: Token {
// //     type: "token",
// //     value: {
// //       index: 2,
// //       token: "!",
// //       lemma: "sum",
// //       xpos: "F1|grn1|casA|gen1",
// //       upos: "PRON",
// //       feats: "Case=Nom|InflClass=LatAnom|Number=Sing|Person=2|PronType=Prs",
// //       start_char: 5,
// //       end_char: 6
// //     },
// //     ancestor: Text {
// //       type: "text",
// //       value: "Salve!",
// //       ancestor: undefined,
// //       generators: []
// //     },
// //     generators: [ [class Text extends Signal] ]
// //   }
// // }
