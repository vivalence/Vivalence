from flask import Flask, request, jsonify
import stanza
import os
from typing import Dict, List, Any

DEFAULT_MODEL_DIR = os.environ.get("STANZA_RESOURCES_DIR")
LANGUAGES = os.environ.get("STANZA_LANGUAGES", "en").split(",")
PROCESSORS = os.environ.get("STANZA_PROCESSORS", "tokenize,mwt,pos,lemma,depparse")
PACKAGE = os.environ.get("STANZA_PACKAGE", "gsd")
SERVICE_PORT = int(os.environ.get("SERVICE_PORT", "5555"))

os.makedirs(DEFAULT_MODEL_DIR, exist_ok=True)

pipelines = {}


def serialize_token(word) -> Dict[str, Any]:
    return {
        "index": word.id,
        "token": word.text,
        "lemma": word.lemma,
        "xpos": word.xpos,
        "upos": word.upos,
        "feats": word.feats,
        "deprel": word.deprel,
        "head": word.head,
        "start_char": word.start_char,
        "end_char": word.end_char,
    }


def serialize_sentence(sentence) -> Dict[str, Any]:
    tokens = [serialize_token(w) for w in sentence.words]
    result = {"tokens": tokens}
    if hasattr(sentence, "constituency") and sentence.constituency:
        result["parse"] = str(sentence.constituency)
    return result


def serialize_doc(doc) -> Dict[str, Any]:
    return {"sentences": [serialize_sentence(s) for s in doc.sentences]}


def model_exists(language: str) -> bool:
    return os.path.exists(os.path.join(DEFAULT_MODEL_DIR, language))


def download_model(language: str, package: str = None):
    kwargs = {"model_dir": DEFAULT_MODEL_DIR, "processors": PROCESSORS}
    if package:
        kwargs["package"] = package
    stanza.download(language.strip(), **kwargs)


def ensure_model(language: str, package: str = None):
    if not model_exists(language):
        download_model(language, package)


def get_pipeline(language: str, processors: str, package: str = None):
    cache_key = f"{language}_{processors}_{package or 'default'}"

    if cache_key not in pipelines:
        ensure_model(language, package)
        kwargs = {
            "lang": language,
            "processors": processors,
            "use_gpu": False,
            "model_dir": DEFAULT_MODEL_DIR,
        }
        if package:
            kwargs["package"] = package
        pipelines[cache_key] = stanza.Pipeline(**kwargs)

    return pipelines[cache_key]


def validate_request(data: Dict) -> tuple[str, str, str, str | None]:
    language = data.get("language")
    text = data.get("text")
    processors = data.get("processors", PROCESSORS)
    package = data.get("package")

    if not all(isinstance(v, str) for v in [language, text, processors] if v):
        raise ValueError("language, text, and processors must be strings")

    if not language or not text:
        raise ValueError("language and text are required")

    return language, text, processors, package


def get_config() -> Dict[str, Any]:
    return {
        "model_dir": DEFAULT_MODEL_DIR,
        "package": PACKAGE,
        "languages": LANGUAGES,
        "processors": PROCESSORS,
        "port": SERVICE_PORT,
        "loaded_pipelines": list(pipelines.keys()),
    }


app = Flask(__name__)


@app.route("/status", methods=["GET"])
def status():
    response = jsonify(
        {
            "status": "alive",
            "config": get_config(),
        }
    )
    response.headers["Content-Type"] = "application/json; charset=utf-8"
    return response


@app.route("/tokenize", methods=["POST"])
def tokenize():
    try:
        data = request.get_json()
        language, text, processors, package = validate_request(data)

        pipeline = get_pipeline(language, processors, package or PACKAGE)
        doc = pipeline(text)

        return jsonify(serialize_doc(doc))

    except ValueError as e:
        response = jsonify({"error": "validation_error", "message": str(e)})
        response.headers["Content-Type"] = "application/json; charset=utf-8"
        return response, 400
    except Exception as e:
        response = jsonify({"error": "internal_error", "message": str(e)})
        response.headers["Content-Type"] = "application/json; charset=utf-8"
        return response, 500


def init_models():
    for lang in LANGUAGES:
        if not model_exists(lang):
            download_model(lang, PACKAGE)


if __name__ == "__main__":
    init_models()
    app.run(host="0.0.0.0", port=SERVICE_PORT)
