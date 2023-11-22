import { fetchOpenAI } from "./shared.js";

/**
 * Evaluates the translation of an English sentence to Spanish using OpenAI.
 * @param {String} english - The sentence in English.
 * @param {String} spanish - The translated sentence in Spanish.
 * @returns {Promise<Object>} - The evaluation result.
 */
async function evaluateTranslation(english, spanish) {
    const prompt = `
Translate the following English sentence to Spanish:

${english}

Translated: ${spanish}

Is this translation, considering grammatical gender as well? If not, please provide the reason in one concise sentence.
`;

    try {
        const response = await fetchOpenAI("https://api.openai.com/v1/completions", {
            engine: "text-davinci-003",
            prompt: prompt,
            max_tokens: 100,
        });

        return response.choices[0].text.trim();
    } catch (error) {
        console.error("Error in evaluateTranslation:", error);
        throw error;
    }
}

export { evaluateTranslation };
