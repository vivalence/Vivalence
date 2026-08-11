import { string } from "@vivalence/typology";

const normalize = (text, forgiving) =>
  forgiving ? string.fold(text ?? "") : (text ?? "").toLowerCase().trim();

export const expected = (knowable, recall) => (recall === "KNOWN" ? knowable.known : knowable.learning);

export const shown = (knowable, recall) => (recall === "KNOWN" ? knowable.learning : knowable.known);

const sentence = (typed, answer, tokens, recall, forgiving) => {
  const whole = normalize(typed, forgiving) === normalize(answer, forgiving);
  if (!tokens?.length) return { signal: whole ? "SUCCESS" : "MISTAKE", tokens: null };

  const remaining = normalize(typed, forgiving).split(/\s+/);
  const key = recall === "KNOWN" ? "gloss" : "form";

  const graded = tokens.map((token) => {
    const text = token[key];
    if (!text) return { ...token, signal: whole ? "SUCCESS" : "MISTAKE" };
    const found = normalize(text, forgiving)
      .split(/\s+/)
      .every((part) => {
        const index = remaining.indexOf(part);
        if (index === -1) return false;
        remaining.splice(index, 1);
        return true;
      });
    return { ...token, signal: found ? "SUCCESS" : "MISTAKE" };
  });

  const landed = graded.filter((token) => token.signal === "SUCCESS").length;
  return {
    signal: landed === graded.length ? "SUCCESS" : landed ? "MISTAKE" : "FAILURE",
    tokens: graded,
  };
};

export const evaluate = ({ typed, knowable, recall, forgiving = true }) => {
  const answer = expected(knowable, recall);
  if (knowable.ontology === "sentence")
    return sentence(typed, answer, knowable.tokens, recall, forgiving);
  if (string.matches(typed, answer, { forgiving })) return { signal: "SUCCESS", tokens: null };
  return { signal: typed.trim() ? "MISTAKE" : "FAILURE", tokens: null };
};

const METHOD = { PICK: "identity", FLIP: "self" };

export const method = (knowable, gameplay) =>
  knowable.judge === "LLM" ? "LLM" : (METHOD[gameplay] ?? "MATCH");

export const describe = (knowable, signal, forgiving) => {
  if (signal === "NEUTRAL") return "acceptable alternative — the honest signal goes to the driver";
  if (knowable.judge === "LLM") return "graded by the /judge aperture";
  return `MATCH, forgiving ${Boolean(forgiving)}`;
};
