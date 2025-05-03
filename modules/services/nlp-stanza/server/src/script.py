from flask import Flask, request, jsonify
import stanza
import logging
import json
import os

from download_models import download_models

print("Download models", download_models)

DEFAULT_MODEL_DIR = os.environ.get("STANZA_RESOURCES_DIR")
os.makedirs(DEFAULT_MODEL_DIR, exist_ok=True)


def verify_inputs(data):
    language = data.get("language")
    text = data.get("text")
    processors = data.get("processors")

    if not all(isinstance(value, str) for value in [language, text, processors]):
        raise ValueError("All inputs must be strings")

    return True


pipelinesCache = dict()


def ensure_stanza(language):
    if not os.path.exists(os.path.join(DEFAULT_MODEL_DIR, language)):
        print(f"Downloading Stanza model for '{language}'...")
        stanza.download(language, model_dir=DEFAULT_MODEL_DIR, download_method=None)


def get_pipeline(language, processors):
    global pipelinesCache
    cacheKey = language + "_" + processors

    ensure_stanza(language)

    if cacheKey not in pipelinesCache:
        print(f"cacheKey: {cacheKey} NOT FOUND! building")
        pipelinesCache[cacheKey] = stanza.Pipeline(
            lang=language, processors=processors, use_gpu=False
        )

    return pipelinesCache[cacheKey]


def parse_doc(doc):
    print("Parsing doc...")
    print(doc)
    serializable_entities = [
        {
            "text": entity.text,
            "type": entity.type,
            "start_char": entity.start_char,
            "end_char": entity.end_char,
        }
        for entity in doc.entities
    ]

    annotated_sentences = []
    for sentence in doc.sentences:
        tokens = []
        deps = []
        for word in sentence.words:
            # print(word)
            tokens.append(
                {
                    "index": word.id,
                    "token": word.text,
                    "lemma": word.lemma,
                    "xpos": word.xpos,
                    "upos": word.upos,
                    "feats": word.feats,
                    "start_char": word.start_char,
                    "end_char": word.end_char,
                }
            )
            deps.append(
                {
                    "dep": word.deprel,
                    "governor": word.head,
                    "governorGloss": sentence.words[word.head - 1].text,
                    "dependent": word.id,
                    "dependentGloss": word.text,
                }
            )

        annotated_sentences.append({"basicDependencies": deps, "tokens": tokens})
        if hasattr(sentence, "constituency") and sentence.constituency is not None:
            annotated_sentences[-1]["parse"] = str(sentence.constituency)

    return annotated_sentences, serializable_entities


app = Flask(
    __name__,
    static_url_path="",
    static_folder=os.path.abspath(os.path.dirname(__file__)),
)


@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "Service is alive"})


@app.route("/nlp", methods=["POST"])
def get_data():
    try:
        data = request.get_json()
        # print(f"request data: {data}")

        try:
            verify_inputs(data)
        except ValueError as error:
            print(f"Error: {error}")
            return jsonify({"error": "Input Validation Error", "err": e}), 500

        language = data["language"]
        stringnlp = data["text"]
        processors = data["processors"]

        pipeline = get_pipeline(language, processors)
        doc = pipeline(stringnlp)

        annotated_sentences, serializable_entities = parse_doc(doc)

        return json.dumps(
            {"sentences": annotated_sentences, "entities": serializable_entities}
        )

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error", "err": e}), 500


if __name__ == "__main__":
    print("Downloading models...")
    download_models()

    print("run app:")
    app.run(host="0.0.0.0", port=5000)
