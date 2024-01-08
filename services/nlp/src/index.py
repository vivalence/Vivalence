from fastapi import FastAPI, HTTPException
import sys
from pydantic import BaseModel
import stanza
import os

# Initialize FastAPI app
app = FastAPI()

# Stanza NLP Pipeline
# stanza.download('es') 
processors = 'tokenize,mwt,pos,lemma,depparse'
nlp_es = stanza.Pipeline(lang='es', processors=processors, download_method=None)

class Sentence(BaseModel):
    sentence: str

@app.post("/")
@app.get("/")
async def process_sentence(request_data: Sentence):
    try:
        # Process the sentence using the stanza pipeline
        doc = nlp_es(request_data.sentence)
        return doc.to_dict()[0]

    except Exception as e:
        # If there's an error, return it as JSON
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))

    # Check if a port argument is provided
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number. Using default port.")

    import uvicorn
    uvicorn.run(app, host="localhost", port=port)
