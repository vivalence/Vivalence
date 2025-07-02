export default (service, _ctx) => {
  const { url, key } = service.config.env;

  if (!url || !key)
    throw new Error("SERVICE NLP URL not found in service definition");

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + key,
  };

  const { language, processors = "tokenize,mwt,pos,lemma,depparse" } =
    service.config;

  if (!language)
    throw new Error("Language must be defined in NLP service config");

  return async function nlp({ text }) {
    if (!text || typeof text !== "string" || text.length === 0)
      throw new Error("Text required");
    if (text.length > 1000) throw new Error("Text too long");

    const response = await fetch(url + "/nlp", {
      method: "POST",
      headers,
      body: JSON.stringify({ text, language, processors }),
    });

    const analysis = await response.json();

    return analysis.sentences.map((s) => s.tokens);
  };
};
