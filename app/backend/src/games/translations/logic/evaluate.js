import Mustache from "mustache";
import { prisma } from "../../../prisma-client.js";
import { getGPTResponse } from "../../../library/openai-client.js";
import GameUnitRelation from "../../library/gameUnitRelation.js";

export default async function evaluate(input) {
    const { gameId, payload, language, sentence, translation } = input;
    try {
        const units = await prisma.unit.findMany({
            where: { id: { in: payload.ids } },
            select: { id: true, data: true },
        });

        const prompt = makePrompt({
            language,
            sentence,
            translation,
            units: units.map((unit) => ({
                id: unit.id,
                word: {
                    learning: unit.data[language.learning],
                    spoken: unit.data[language.spoken],
                },
            })),
        });

        const response = await getGPTResponse({ prompt: [prompt] });

        const promises = [];
        for (const evaluation of response.evaluations) {
            promises.push(
                GameUnitRelation.handle({
                    gameId,
                    unitId: evaluation.id,
                    response: evaluation.evaluation,
                }),
            );
        }
        await Promise.all(promises);

        return response.feedback;
    } catch (error) {
        console.error("Error in evaluate:", error);
        throw error;
    }
}

function makePrompt(input) {
    const promptTemplate = `
A language learner was prompted with a {{language.spoken}} sentence and asked to provide the {{language.learning}} translation as a learning exercise.
You provide feedback on the translation for the user,
and you provide an technical evaluation on the successfull usage of specific individual words.

Feedback:
Assess each part-of-speech and the overall quality of the translation.
Include a score and classification for both individual parts and the entire sentence.

The learner was prompted with this sentence:
<prompt>{{{sentence.spoken}}}</prompt>

The learner provided this translation:
<translation>{{translation}}</translation>

This was the originially intended translation, but the learner never saw it:
<translation>{{sentence.learning}}</translation>

Evaluation:
The sentence was generated from these words:
{{#units}}
{ id: "{{id}}", {{language.spoken}}: "{{word.spoken}}", {{language.learning}}: "{{word.learning}}" },
{{/units}}
Evaluate whether the usage of these words as either KNOWN or UNKNOWN.


Respond in this json structure exactly:
"""
FeedbackEnum = "correct" // If it is correct
    | "info" // If it is correct but not the best way to say it
    | "mistake" // If it is incorrect but understandable
    | "failure" // If it is incorrect and not understandable

EvaluationEnum = "KNOWN" | "UNKNOWN" 

{
  "feedback": {
    "parts": [{ // Breakdown of the sentence into parts of speech
	"part": String, // The part in the sentence
	"correction": Optional<String>, // The correction of the word, if the word was not perfectly correct
	"translation": String, // The translation of the part of speech
	"classification": FeedbackEnum, // Categorized quality of this part of speech
    }],
    "correction": Optional<String>, // The correction of the whole sentence, if the sentence was incorrect
    "score": Float, // Number between 0 and 1, indicating the quality of the translation.
    "classification": FeedbackEnum, // Categorized quality of the translation
    "feedback": String, // One sentence on the quality of the translation, providing valuable feedback to the learner
  },
  "evaluations": [{
    id: "ID",
    evaluation: EvaluationEnum
  }]
}
"""`;
    const prompt = Mustache.render(promptTemplate, input);
    return prompt;
}

// const evaluation = await evaluate(inputTest);
// const inputTest = {gameId: "clpr5668n0000g01pvnkghden", translation: "ser muy paciencia", language: {learning: "spanish", spoken: "english",}, payload: JSON.parse('{"spoken":"To be very patient","learning":"Ser muy paciente","ids":["clpl42ky60000g0mayurk9lny","clnt09id70010g0nukms326hd"]}',), sentence: {learning: "Ser muy paciente", spoken: "To be very patient",},}; const evaluationTest = {feedback: {parts: [{part: "ser", translation: "to be", classification: "correct",}, {part: "muy", translation: "very, really", classification: "correct",}, {part: "paciencia", correction: "paciente", translation: "patient", classification: "mistake",},], correction: "Ser muy paciente", score: 0.67, classification: "mistake", feedback: "The translation is mostly correct, but 'paciencia' should be 'paciente' to correctly match the adjective form in English.",}, evaluations: [{id: "clnt09id70010g0nukms326hd", evaluation: "correct",}, {id: "clpl42ky60000g0mayurk9lny", evaluation: "correct",},],};
