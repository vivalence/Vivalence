import { Feature } from "@vivalence/shared/classifier";

export default function classifierFactory(runtime) {
  return (ontology) => {
    const ctx = {
      assert: ontology.assert,
      services: runtime.services,
    };

    const classify = ontology.classifier
      .on(Feature, async (feature, ctx) => {
        // console.log("classifier on feature", feature);
        // await ctx.assert.existance(feature.annotation);
        // remedy
        return feature;
      })
      .factory(ctx);

    return classify;
  };
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
