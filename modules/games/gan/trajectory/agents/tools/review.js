import { Type } from "@sinclair/typebox";
export default (trajectory, ctx) =>
  trajectory.open(
    (p) =>
      p.sig({
        path: "/review/annotation",
        valence: `# Review: Updates a hidden representation of our confidence that the learner knows a learnable unit.
	    This method takes one annotation object and a signal of whether the learner knows this unit. `,
        input: Type.Object({
          signal: Type.Union(
            [Type.Literal("SUCCESS"), Type.Literal("MISTAKE")],
            { description: "describes if the signal is positive or negative." },
          ),
          annotation: Type.Record(
            Type.String({ description: "" }),
            Type.String({ description: "" }),
            {
              description: `A annotation describes the smallest learnable unit uniquely!
		Example Annotations: {"lemma":"cum","pos":"sconj","prontype":"rel"},{"lemma":"sapiens","pos":"adj","case":"nom","gender":"masc","inflclass":"indeuro","number":"plur"},{"lemma":"philosophus","pos":"noun","case":"nom","gender":"masc","inflclass":"indeuro","number":"plur"} `,
            },
          ),
        }),
      }),
    async (input) => {
      console.log("[TRAJECTORY REVIEW CALLED] input", input);
      const result = await ctx.runtime.call("/review/annotation", input);
      console.log("[REVIEW ANNOTATION RESULT]", result);
    },
  );
