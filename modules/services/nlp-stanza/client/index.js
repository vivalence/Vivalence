// import url from "@vivalence/config";
import config from "@vivalence/config";

export default () => {
  const { SERVICE_NLP_URL, SERVICE_NLP_KEY } = config.env;

  if (!SERVICE_NLP_URL || !SERVICE_NLP_KEY)
    throw new Error("SERVICE NLP URL not found in environment");

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + SERVICE_NLP_KEY,
  };

  return async function nlp({ text }) {
    if (!text || typeof text !== "string" || text.length === 0)
      throw new Error("Text required");
    if (text.length > 1000) throw new Error("Text too long");

    const response = await fetch(SERVICE_NLP_URL + "/nlp", {
      method: "POST",
      headers,
      body: JSON.stringify({
        text: text,
        language: "es",
        processors: "tokenize,mwt,pos,lemma,depparse",
      }),
    });

    const analysis = await response.json();

    return analysis.sentences.map((s) => s.tokens);
  };
};
