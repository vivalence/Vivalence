import openai
import yaml
from flask import Flask, request, jsonify
from difflib import SequenceMatcher

#put in a utils file at some point
def get_api_key_from_yaml(keyword):
    with open('config.yaml', 'r') as file:
        config = yaml.safe_load(file)
        return config.get(keyword, {}).get('api_key', None)

app = Flask(__name__)
openai.api_key = get_api_key_from_yaml('openai')

@app.route('/process_request', methods=['POST'])
@app.route('/process_request', methods=['POST'])
def process_request():
    data = request.json
    action = data.get("action")

    if action == "evaluate":
        english_sentence = data.get("english")
        spanish_translation = data.get("spanish")
        spanish_true = data.get("spanish_true")  
        evaluation = check_translation(english_sentence, spanish_translation, spanish_true)
        return jsonify(evaluation)

    elif action == "generate":
        constraints = data.get("constraints")
        if not constraints:
            return jsonify({'error': 'Missing or null "constraints" key in the request data.'}), 400
        sentences = generate_sentences(constraints)
        return jsonify(sentences)

    else:
        return jsonify({"error": "Invalid action type"}), 400




def check_translation(english, spanish, spanish_true):
    # Using OpenAI to evaluate correctness
    prompt = f"Translate the following English sentence to Spanish:\n\n{english}\n\nTranslated: {spanish}\n\nIs this translation, considering grammatical gender as well? If not, please provide the reason in one concise sentence."
    response = openai.Completion.create(engine="text-davinci-003", prompt=prompt, max_tokens=100)
    feedback = response.choices[0].text.strip()
    
    # Calculate accuracy using SequenceMatcher
    accuracy = SequenceMatcher(None, spanish, spanish_true).ratio()

    return {
        "accuracy": f"{accuracy * 100:.2f}%",
        "feedback": feedback
    }


def generate_sentences(constraints):
    spoken_language = constraints.get("spokenLanguage", "English")
    learning_language = constraints.get("learningLanguage", "Spanish")
    words = constraints.get("words", [])
    
    spoken_words = [w["spoken"] for w in words]
    learning_words = [w["learning"] for w in words]
    
    grammar = constraints.get("grammar", {})
    verb = grammar.get("verb", "")
    tense = grammar.get("tense", "")
    performer = grammar.get("performer", "")
    mood = grammar.get("mood", "")

    # Formulate the prompt
    prompt = (f"Using the following constraints, generate a sentence in {spoken_language} and its translation in {learning_language}:\n"
              f"Words in {spoken_language}: {', '.join(spoken_words)}\n"
              f"Words in {learning_language}: {', '.join(learning_words)}\n"
              f"Grammar - Verb: {verb}, Tense: {tense}, Performer: {performer}, Mood: {mood}\n\n"
              f"{learning_language}: ")

    max_tokens = constraints.get("length", 150)
    response = openai.Completion.create(engine="text-davinci-003", prompt=prompt, max_tokens=max_tokens)

    generated_text = response.choices[0].text.strip().split("\n")
    
    if len(generated_text) >= 2:
        return {
            "sentenceSpoken": generated_text[1].replace(f"{spoken_language}: ", "").strip(),
            "sentenceLearning": generated_text[0]
        }
    else:
        return {"error": "Failed to generate sentences"}



if __name__ == '__main__':
    app.run(debug=True)
