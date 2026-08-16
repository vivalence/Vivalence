import { string } from "@vivalence/typology";

const bare = (text) => (text ?? "").replace(/\(.*?\)/g, "");

const normalize = (text, forgiving, language) =>
  string.contract(bare(text), language?.contractions ?? {}, forgiving ? string.fold : (value) => value.toLowerCase().trim());

const options = (forgiving, language) => ({
  forgiving,
  contractions: language?.contractions ?? null,
  elision: language?.elision ?? false,
});

export const expected = (knowable, recall) => (recall === "KNOWN" ? knowable.known : knowable.learning);

export const shown = (knowable, recall) => (recall === "KNOWN" ? knowable.learning : knowable.known);

const sentence = (typed, answer, tokens, recall, forgiving, language) => {
  const whole = string.matches(bare(typed), answer, options(forgiving, language));
  if (!tokens?.length) return { signal: whole ? "SUCCESS" : "MISTAKE", tokens: null };

  const remaining = normalize(typed, forgiving, language).split(/\s+/);
  const key = recall === "KNOWN" ? "gloss" : "form";

  const graded = tokens.map((token) => {
    const text = token[key];
    if (!text) return { ...token, signal: whole ? "SUCCESS" : "MISTAKE" };
    const found = normalize(text, forgiving, language)
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

export const evaluate = ({ typed, knowable, recall, forgiving = true, language = null }) => {
  const answer = expected(knowable, recall);
  if (knowable.ontology === "sentence")
    return sentence(typed, answer, knowable.tokens, recall, forgiving, language);
  if (string.matches(bare(typed), answer, options(forgiving, language))) return { signal: "SUCCESS", tokens: null };
  return { signal: typed.trim() ? "MISTAKE" : "FAILURE", tokens: null };
};

const METHOD = { PICK: "identity", FLIP: "self" };

export const method = (knowable, gameplay) =>
  knowable.judge === "LLM" ? "LLM" : (METHOD[gameplay] ?? "MATCH");

export const describe = (knowable, signal) => {
  if (signal === "NEUTRAL") return "acceptable alternative — the honest signal goes to the driver";
  if (knowable.judge === "LLM") return "graded by the /judge aperture";
  return null;
};
