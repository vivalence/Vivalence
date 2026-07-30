import json
import os
import re
import shutil
import sys

TOPOGRAPHY = "/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian"
HARVEST = f"{TOPOGRAPHY}/.harvest"
CANDIDATES = f"{HARVEST}/candidates"
FREIGHT_WORDS = f"{TOPOGRAPHY}/freight/audio/words"

DIACRITICS = {
    "à": "a-gv", "è": "e-gv", "é": "e-ac", "ì": "i-gv", "ò": "o-gv", "ù": "u-gv",
}


def encode_form(form):
    out = form
    for char, code in DIACRITICS.items():
        out = out.replace(char, f"{code}-")
    out = out.rstrip("-")
    return re.sub(r"-+", "-", out)


def manifest():
    entries = {}
    for form in sorted(os.listdir(CANDIDATES)):
        form_dir = f"{CANDIDATES}/{form}"
        if not os.path.isdir(form_dir):
            continue
        speakers = sorted(f.removesuffix(".mp3") for f in os.listdir(form_dir) if f.endswith(".mp3"))
        if speakers:
            entries[form] = speakers
    json.dump(entries, open(f"{HARVEST}/word-candidates.json", "w"), ensure_ascii=False, indent=1)
    print(f"word-candidates.json: {len(entries)} forms with ≥1 candidate")


def form_slugs():
    import glob
    mapping = {}
    for fpath in sorted(glob.glob(f"{TOPOGRAPHY}/dataset/literals/words/*.js")):
        if fpath.endswith("index.js"):
            continue
        content = open(fpath).read()
        raw = content.replace("export default ", "").rstrip().rstrip(";")
        raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
        raw = re.sub(r",(\s*[}\]])", r"\1", raw)
        for entity in json.loads(raw):
            mapping.setdefault(entity["trait"]["TRANSLATED"]["learning"].lower(), []).append(entity["slug"])
    return mapping


def compile_picks():
    picks = json.load(open(f"{HARVEST}/word-audio-picks.json"))["picks"]
    mapping = form_slugs()
    os.makedirs(FREIGHT_WORDS, exist_ok=True)
    inject = {}
    for form, speaker in picks.items():
        source = f"{CANDIDATES}/{form}/{speaker}.mp3"
        if not os.path.exists(source):
            print(f"MISSING candidate: {form}/{speaker}")
            continue
        for slug in mapping.get(form, []):
            filename = f"{slug}.mp3"
            shutil.copyfile(source, f"{FREIGHT_WORDS}/{filename}")
            inject[slug] = f"words/{filename}"
    json.dump(inject, open(f"{HARVEST}/vocalized-inject.json", "w"), ensure_ascii=False, indent=1)
    print(f"promoted {len(inject)} assets; VOCALIZED injection map -> vocalized-inject.json")
    print("NEXT: run inject step (surgical VOCALIZED insertion per criteria law) — separate reviewed step")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "compile":
        compile_picks()
    else:
        manifest()
