import { fetchOpenAI } from "../../../library/openai-client.js";

/**
 * Generates sentences based on specified constraints using OpenAI.
 * @param {Object} constraints - The constraints for sentence generation.
 * @returns {Promise<Object>} - The generated sentences.
 */
async function generateSentences(constraints) {
    const prompt = `
Using the following constraints,
generate a sentence in ${constraints.spokenLanguage}
and its translation in ${constraints.learningLanguage}:

Words in ${constraints.spokenLanguage}: ${constraints.words.map((w) => w.spoken).join(", ")}
Words in ${constraints.learningLanguage}: ${constraints.words.map((w) => w.learning).join(", ")}

Grammar - Verb: ${constraints.grammar.verb},
Tense: ${constraints.grammar.tense},
Performer: ${constraints.grammar.performer},
Mood: ${constraints.grammar.mood}

${constraints.learningLanguage}: `;

    try {
        const response = await fetchOpenAI("https://api.openai.com/v1/completions", {
            engine: "text-davinci-003",
            prompt: prompt,
            max_tokens: constraints.length || 150,
        });

        return response.choices[0].text.trim().split("\n");
    } catch (error) {
        console.error("Error in generateSentences:", error);
        throw error;
    }
}

export { generateSentences };
