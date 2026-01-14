import { Url, Connection } from "@vivalence/typology";

export default function provider(service) {
  const url = service.statics.remote;
  const key = service.secrets.key;

  if (!url || !key)
    throw new Error("SERVICE NLP URL not found in service definition");

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + key,
  };

  const { language, processors = "tokenize,mwt,pos,lemma,depparse" } =
    service.statics;

  if (!language)
    throw new Error("Language must be defined in NLP service config");

  const connection = new Connection(new Url(url));

  return async ({ text }) => {
    if (!text || typeof text !== "string" || text.length === 0)
      throw new Error("Text required");
    if (text.length > 1000) throw new Error("Text too long");

    const result = await connection
      .use(async (ctx, next) => {
        await next();
        ctx.response.body = JSON.parse(ctx.response.body);
      })
      .fetch(
        "/nlp",
        {
          text,
          language,
          processors,
        },
        {
          method: "POST",
          headers,
        },
      );

    return result.body.sentences.map((s) => s.tokens);
  };
}
