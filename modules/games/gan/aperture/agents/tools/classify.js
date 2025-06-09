import { Type } from "@sinclair/typebox";
export default (trajectory, ctx) =>
  trajectory.open(
    (p) =>
      p.sig({
        path: "/classify/text",
        input: Type.Object({ text: Type.String() }),
        valence: `# Classifier: extracts features from signal.
	You pass it some text string, and the classifier will parse it into a set of annotations and tokens.
	Annotations are attributes about individual units of the text, as they are understood by the system.
	Annotations are used as input to the 'review annotation' function.
	Input Examples: { text: "Veni, vidi, vici." } { text: "Carpe diem." } { text: "Alea iacta est." } { text: "Per aspera ad astra." }
	Example Annotations: {"lemma":"cum","pos":"sconj","prontype":"rel"},{"lemma":"sapiens","pos":"adj","case":"nom","gender":"masc","inflclass":"indeuro","number":"plur"},{"lemma":"philosophus","pos":"noun","case":"nom","gender":"masc","inflclass":"indeuro","number":"plur"}
    `,
      }),
    async (input) => {
      // console.log("gan/librarian/classify input", input);
      let features = await ctx.runtime.classify.text(input.text);
      // console.log("gan/librarian/classify  features", features);

      features = features //
        .map(({ token, annotation }) => ({ token, annotation }));
      return features;
    },
  );
