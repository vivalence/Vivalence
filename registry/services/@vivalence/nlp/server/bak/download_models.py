import os
import stanza


def download_models():
    DEFAULT_MODEL_DIR = os.environ.get("STANZA_RESOURCES_DIR")
    languages = os.environ.get("STANZA_LANGUAGES", "en,es").split(",")
    processors = os.environ.get("STANZA_PROCESSORS", "tokenize,mwt,pos,lemma,depparse")

    print("Downloading models:")
    print("DEFAULT_MODEL_DIR", DEFAULT_MODEL_DIR)
    print("languages", languages)
    print("processors", processors)

    for language in languages:
        if not os.path.exists(os.path.join(DEFAULT_MODEL_DIR, language)):
            print(f"Downloading {language} model...")
            stanza.download(
                language.strip(), processors=processors, model_dir=DEFAULT_MODEL_DIR
            )
        else:
            print(f"Model for {language} already exists. Skipping download.")


if __name__ == "__main__":
    download_models()
