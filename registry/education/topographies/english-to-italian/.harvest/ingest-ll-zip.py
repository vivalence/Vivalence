import glob
import json
import os
import re
import subprocess
import sys
import unicodedata

HARVEST = os.path.dirname(os.path.abspath(__file__))
TOPOGRAPHY = os.path.dirname(HARVEST)
CANDIDATES = f"{HARVEST}/candidates"
STATE_PATH = f"{HARVEST}/harvest-words-state.json"


def read_entities(fpath):
    raw = open(fpath).read().replace("export default ", "").rstrip().rstrip(";")
    raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
    raw = re.sub(r",(\s*[}\]])", r"\1", raw)
    return json.loads(raw)


def slug_speaker(speaker):
    ascii_form = unicodedata.normalize("NFD", speaker).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9]+", "-", ascii_form).strip("-").lower() or "anon"


forms = set()
for fpath in sorted(glob.glob(f"{TOPOGRAPHY}/dataset/literals/words/*.js")):
    if fpath.endswith("index.js"):
        continue
    for entity in read_entities(fpath):
        forms.add(entity["trait"]["TRANSLATED"]["learning"].lower())

root = sys.argv[1]
state = json.load(open(STATE_PATH))

converted = skipped_existing = failed = 0
matched_forms = set()
for speaker_dir in sorted(os.listdir(root)):
    speaker_path = f"{root}/{speaker_dir}"
    if not os.path.isdir(speaker_path):
        continue
    speaker = slug_speaker(speaker_dir)
    for filename in os.listdir(speaker_path):
        if not filename.endswith((".ogg", ".wav", ".mp3", ".oga")):
            continue
        form = filename.rsplit(".", 1)[0].lower()
        if form not in forms:
            continue
        matched_forms.add(form)
        form_dir = f"{CANDIDATES}/{form}"
        dest = f"{form_dir}/{speaker}.mp3"
        if os.path.exists(dest):
            skipped_existing += 1
            continue
        os.makedirs(form_dir, exist_ok=True)
        result = subprocess.run(
            ["ffmpeg", "-y", "-i", f"{speaker_path}/{filename}", "-af",
             "loudnorm=I=-18:TP=-2:LRA=11", "-ar", "44100", "-b:a", "128k", dest],
            capture_output=True, timeout=120,
        )
        if result.returncode == 0 and os.path.getsize(dest) > 2000:
            converted += 1
        else:
            if os.path.exists(dest):
                os.remove(dest)
            failed += 1

for form in matched_forms:
    speakers = sorted(f.removesuffix(".mp3") for f in os.listdir(f"{CANDIDATES}/{form}") if f.endswith(".mp3"))
    if speakers:
        state["done"][form] = speakers
        state["failed"].pop(form, None)

tmp = STATE_PATH + ".tmp"
json.dump(state, open(tmp, "w"), ensure_ascii=False, indent=1)
os.replace(tmp, STATE_PATH)

print(f"matched forms {len(matched_forms)} · converted {converted} · already-had {skipped_existing} · failed {failed}")
print(f"state done now {len(state['done'])}")
