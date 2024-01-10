import sys
from pydantic import BaseModel
import stanza
from fastapi import FastAPI, HTTPException
import os
from stanza.resources.common import DEFAULT_MODEL_DIR

stanza_model_dir = DEFAULT_MODEL_DIR
os.makedirs(stanza_model_dir, exist_ok=True)
print(f"Stanza model directory: {stanza_model_dir}")

def download_stanza_model(language, model_dir):
    if not os.path.exists(os.path.join(model_dir, language)):
        print(f"Downloading Stanza model for '{language}'...")
        stanza.download(language, model_dir=model_dir)
    else:
        print(f"Stanza model for '{language}' already exists. Skipping download.")

download_stanza_model('es', stanza_model_dir)

processors = 'tokenize,mwt,pos,lemma,depparse'
nlp_es = stanza.Pipeline(lang='es', processors=processors, download_method=None)

class Sentence(BaseModel):
    sentence: str

app = FastAPI()

@app.post("/")
@app.get("/")
async def process_sentence(request_data: Sentence):
    try:
        doc = nlp_es(request_data.sentence)
        return doc.to_dict()[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ping")
async def process_sentence():
    try:
        return "Hello world!"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))

    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number. Using default port.")

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port)
