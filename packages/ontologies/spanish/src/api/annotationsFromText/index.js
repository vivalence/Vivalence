import annotate from "./annotate";

export default async function ({ text }, { nlp }) {
    const { analysis } = await nlp({ text });

    const annotations = analysis.sentences.map((sentence) => {
        return sentence.tokens.map(annotate);
    });

    return annotations;
}
