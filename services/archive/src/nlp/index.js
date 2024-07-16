import fetch from "node-fetch";

export default async function nlp({ text }) {
  const { SERVICE_NLP_URL: URL, SERVICE_NLP_KEY: KEY } = process.env;
  if (!URL || KEY) throw new Error("SERVICES_NLP_URL not found in environment variables");
  if (!text || typeof text !== "string" || text.length === 0) throw new Error("Text required");
  if (text.length > 1000) throw new Error("Text too long");

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + KEY,
    },
    body: JSON.stringify({
      text: text,
      language: "es",
      processors: "tokenize,mwt,pos,lemma,depparse",
    }),
  });
  const analysis = await response.json();

  return { analysis: analysis };
}
// };
