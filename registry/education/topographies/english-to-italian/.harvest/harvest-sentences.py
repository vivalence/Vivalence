import json
import os
import re
import subprocess
import sys
import time
import unicodedata
import urllib.request

TOPOGRAPHY = "/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian"
HARVEST = f"{TOPOGRAPHY}/.harvest"
FREIGHT = f"{TOPOGRAPHY}/freight/audio/sentences"
STATE_PATH = f"{HARVEST}/harvest-sentences-state.json"
UA = "vivalence-harvester/0.1"


def sentence_slug(text):
    ascii_form = unicodedata.normalize("NFD", text.lower()).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_form).strip("-")


def load_state():
    if os.path.exists(STATE_PATH):
        return json.load(open(STATE_PATH))
    return {"done": {}, "failed": []}


def save_state(state):
    tmp = STATE_PATH + ".tmp"
    json.dump(state, open(tmp, "w"), ensure_ascii=False, indent=1)
    os.replace(tmp, STATE_PATH)


def download(audio_id, dest_mp3, tries=4):
    raw = dest_mp3 + ".raw"
    for attempt in range(tries):
        try:
            req = urllib.request.Request(f"https://tatoeba.org/audio/download/{audio_id}", headers={"User-Agent": UA})
            data = urllib.request.urlopen(req, timeout=120).read()
            open(raw, "wb").write(data)
            normalized = subprocess.run(
                ["ffmpeg", "-y", "-i", raw, "-af", "loudnorm=I=-18:TP=-2:LRA=11",
                 "-ar", "44100", "-b:a", "128k", dest_mp3],
                capture_output=True, timeout=120,
            )
            os.remove(raw)
            if normalized.returncode == 0 and os.path.getsize(dest_mp3) > 4000:
                return True
            if os.path.exists(dest_mp3):
                os.remove(dest_mp3)
            return False
        except Exception:
            time.sleep(5 * (attempt + 1))
    if os.path.exists(raw):
        os.remove(raw)
    return False


selection_path = sys.argv[1] if len(sys.argv) > 1 else f"{HARVEST}/sentence-selection.json"
selection = json.load(open(selection_path))
pool = {record["sid"]: record for record in json.load(open(f"{HARVEST}/nm1-pool.json"))}
state = load_state()
os.makedirs(FREIGHT, exist_ok=True)

pending = [sid for sid in selection if str(sid) not in state["done"] and sid not in state["failed"]]
print(f"selection {len(selection)}, pending {len(pending)}", flush=True)

for position, sid in enumerate(pending):
    record = pool[sid]
    slug = sentence_slug(record["text"])
    dest = f"{FREIGHT}/{slug}.mp3"
    if os.path.exists(dest) or download(record["audio"], dest):
        state["done"][str(sid)] = slug
    else:
        state["failed"].append(sid)
    save_state(state)
    time.sleep(2)
    if (position + 1) % 25 == 0:
        print(f"[{position + 1}/{len(pending)}] done {len(state['done'])} failed {len(state['failed'])}", flush=True)

print(f"COMPLETE: done {len(state['done'])}, failed {len(state['failed'])}", flush=True)
