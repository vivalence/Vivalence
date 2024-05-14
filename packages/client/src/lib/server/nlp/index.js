import { env } from "$env/dynamic/private";
const { SERVICE_NLP_URL } = env;
import fetch from "node-fetch";

export default async function nlp({ text }) {
    try {
        const response = await fetch(SERVICE_NLP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: text,
                language: "es",
                processors: "tokenize,mwt,pos,lemma,depparse"
            })
        });
        const analysis = await response.json();
        return { analysis };
    } catch (err) {
        console.error(`[NLP ERROR lib/nlp]`, err.message);
        console.error(err);
        return { error: err };
    }
}
