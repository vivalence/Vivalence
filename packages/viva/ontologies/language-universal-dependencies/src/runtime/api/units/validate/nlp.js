export default async function (unit, locals) {
    if (!["pron", "det"].includes(unit.annotation.pos)) return { isValid: true };

    const issues = [];
    if (!unit.spanish || !unit.usageInSpanish)
        return { isValid: false, issues: [], message: "missing fields" };

    const token = await (async function fromNLP() {
        const { data: annotations, error: nlpError } = await locals.post(
            `/api/classifier/annotate/fromText`,
            { text: unit.usageInSpanish }
        );
        if (nlpError) throw nlpError;

        const token = annotations
            .flat()
            .find((a) => a.meta.token.toLowerCase() === unit.spanish.toLowerCase());

        if (token) return token;
        else {
            console.log("no token found for");
            console.log("unit:");
            console.log(unit);
            console.log("annotations:");
            console.log(annotations.flat());
            throw new Error("no token found");
        }
    })();

    // go over each token[key] (sin meta)
    // if token[key] !== unit.annotation[key]
    // issue

    for (const key in token) {
        if (!["pos", "lemma"].includes(key)) continue;
        if (key === "meta") continue;

        if (token[key] !== unit.annotation[key]) {
            issues.push({
                message: `nlp() ${key}:${token[key]} doesnt match unit.annotation  ${key}:${unit.annotation[key]}`,
                path: ["unit", "annotation", key],
                violation: "mismatch",
                context: {
                    unit,
                    patch: {
                        ontology: { branch: key, leaf: token[key] },
                        annotation: { [key]: token[key] }
                    }
                }
            });
        }
    }

    return { isValid: issues.length === 0, issues };
}

// unit statement: {
//   spanish: 'suyo',
//   english: 'his',
//   id: '08e3a49d-ceac-48b2-9d07-84580638c019',
//   usageInEnglish: 'The book is his.',
//   usageInSpanish: 'El libro es suyo.',
//   annotation: {
//     pos: 'det',
//     poss: 'yes',
//     lemma: 'suyo',
//     gender: 'masc',
//     number: 'sing',
//     person: '3',
//     prontype: 'prs'
//   },
//   tags: [
//     { branch: 'person', leaf: '3' },
//     { branch: 'pos', leaf: 'det' },
//     { branch: 'gender', leaf: 'masc' },
//     { branch: 'poss', leaf: 'yes' },
//     { branch: 'number', leaf: 'sing' },
//     { branch: 'prontype', leaf: 'prs' }
//   ]
// }
// token: {
//   lemma: 'suyo',
//   pos: 'det',
//   gender: 'masc',
//   number: 'sing',
//   person: '3',
//   poss: 'yes',
//   prontype: 'prs',
//   meta: {
//     token: 'suyo',
//     index: 4,
//     start_char: 12,
//     end_char: 16,
//     upos: 'DET',
//     feats: 'Gender=Masc|Number=Sing|Person=3|Poss=Yes|PronType=Prs'
//   }
// }
