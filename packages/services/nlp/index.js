import config from "@vivalence/config";

export default () => {
  const { PRIVATE_SERVICE_NLP_URL: URL, PRIVATE_SERVICE_NLP_KEY: KEY } = config.env;
  if (!URL || KEY) throw new Error("SERVICES NLP URL not found in environment");
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + KEY
  };

  return async function nlp({ text }) {
    if (!text || typeof text !== "string" || text.length === 0) throw new Error("Text required");
    if (text.length > 1000) throw new Error("Text too long");

    const response = await fetch(URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text: text,
        language: "es",
        processors: "tokenize,mwt,pos,lemma,depparse"
      })
    });

    const analysis = await response.json();

    return { analysis };
  };
};
