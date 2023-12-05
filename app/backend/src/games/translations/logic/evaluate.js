import { prisma } from "../../../prisma-client.js";
import { getGPTResponse } from "../../../library/openai-client.js";

export default async function evaluate({ learningLanguage, spokenLanguage, sentence, userInput }) {
    const response = {
        parts: [
            {
                part: "El año",
                correction: null,
                translation: "The year",
                classification: "correct",
            },
            {
                part: "vas",
                correction: "va a ser",
                translation: "is going to be",
                classification: "mistake",
            },
            {
                part: "muy bueno",
                correction: "genial",
                translation: "great",
                classification: "info",
            },
        ],
        correction: "Este año va a ser genial",
        score: 0.6,
        classification: "mistake",
        feedback:
            "The use of 'vas' is incorrect as it is a form of 'ir' conjugated for 'tú'; the rest of the sentence structure also needed adjustments. 'Muy bueno' conveys 'very good' which is understandable but 'genial' is closer to 'great'.",
    };
    return response;

    try {
        const prompt = `Provide feedback for a language learner's translation.
The learner is practicing ${learningLanguage} and speaks ${spokenLanguage}. Respond in ${spokenLanguage}.

The learner was prompted with a ${spokenLanguage} sentence and asked to provide the ${learningLanguage} translation.

Assess each part of speech and the overall quality of their translation. Include a score and classification for both individual parts and the entire sentence as a learning exercise.

The learner was prompted with this sentence:
<prompt>${sentence.spoken}</prompt>

The learner provided this translation:
<translation>${userInput}</translation>

This was the originially intended translation, but the learner never saw it:
<translation>${sentence.learning}</translation>

Respond in this json structure and format exactly:
"""
ClassificationEnum = "correct" // If it is correct
    | "info" // If it is correct but not the best way to say it
    | "mistake" // If it is incorrect but understandable
    | "failure" // If it is incorrect and not understandable

{
    "parts": [{ // Breakdown of the sentence into parts of speech
	"part": String, // The part in the sentence
	"correction": Optional<String>, // The correction of the word, if the word was not perfectly correct
	"translation": String, // The translation of the part of speech
	"classification": ClassificationEnum, // Categorized quality of this part of speech
    }],
    "correction": Optional<String>, // The correction of the whole sentence, if the sentence was incorrect
    "score": Float, // Number between 0 and 1, indicating the quality of the translation.
    "classification": ClassificationEnum, // Categorized quality of the translation
    "feedback": String, // One sentence on the quality of the translation, providing valuable feedback to the learner
}
"""`;
        const evaluation = await getGPTResponse({ prompt: [prompt] });
        return evaluation;
    } catch (error) {
        console.error("Error in evaluate:", error);
        throw error;
    }
}

// const evaluation = await evaluate({
//     learning: "spanish",
//     spoken: "english",
//     sentence: {
//         spoken: "This year is going to be great.",
//         learning: "Este año va a ser genial.",
//     },
//     input: "el año vas muy bueno.",
// });

// measure response time
// const prompt = `Tell me a joke in json`;
// const start = Date.now();
// console.log("start", start);
// const evaluation = await getGPTResponse({ prompt: [prompt] });
// const end = Date.now();
// console.log("end", end);
// console.log("duration",( end - start)/1000);
// console.log("evaluation", evaluation);
