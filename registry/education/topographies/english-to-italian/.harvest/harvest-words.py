import glob
import json
import os
import re
import subprocess
import time
import urllib.parse
import urllib.request

TOPOGRAPHY = "/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian"
HARVEST = f"{TOPOGRAPHY}/.harvest"
CANDIDATES = f"{HARVEST}/candidates"
STATE_PATH = f"{HARVEST}/harvest-words-state.json"
UA = "vivalence-harvester/0.1"
MAX_PER_FORM = 2
TARGET_DONE = 2025
PREFERENCE = ["wiktionary", "happypheasant", "ciampix", "langpao", "xana000", "cerchia-g"]


def preference_rank(speaker):
    slug = slug_speaker(speaker)
    return PREFERENCE.index(slug) if slug in PREFERENCE else len(PREFERENCE)


def read_entities(fpath):
    content = open(fpath).read()
    raw = content.replace("export default ", "").rstrip().rstrip(";")
    raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
    raw = re.sub(r",(\s*[}\]])", r"\1", raw)
    return json.loads(raw)


def dataset_forms():
    forms = {}
    zipfs = {}
    for fpath in sorted(glob.glob(f"{TOPOGRAPHY}/dataset/literals/words/*.js")):
        if fpath.endswith("index.js"):
            continue
        for entity in read_entities(fpath):
            learning = entity["trait"]["TRANSLATED"]["learning"].lower()
            forms.setdefault(learning, entity["slug"])
            ranked = entity["trait"].get("RANKED") or {}
            zipfs[learning] = max(zipfs.get(learning, 0), ranked.get("zipf", 0))
    ordered = dict(sorted(forms.items(), key=lambda item: -zipfs.get(item[0], 0)))
    return ordered


def load_state():
    if os.path.exists(STATE_PATH):
        return json.load(open(STATE_PATH))
    return {"done": {}, "failed": {}}


def save_state(state):
    tmp = STATE_PATH + ".tmp"
    json.dump(state, open(tmp, "w"), ensure_ascii=False, indent=1)
    os.replace(tmp, STATE_PATH)


def api(params, tries=5):
    qs = urllib.parse.urlencode({"format": "json", **params})
    for attempt in range(tries):
        try:
            req = urllib.request.Request(f"https://commons.wikimedia.org/w/api.php?{qs}", headers={"User-Agent": UA})
            return json.load(urllib.request.urlopen(req, timeout=60))
        except Exception:
            time.sleep(5 * (attempt + 1))
    return None


def resolve_urls(titles):
    urls = {}
    for start in range(0, len(titles), 40):
        chunk = titles[start:start + 40]
        result = api({"action": "query", "prop": "imageinfo", "iiprop": "url", "titles": "|".join(chunk)})
        for page in (result or {}).get("query", {}).get("pages", {}).values():
            if page.get("title") and page.get("imageinfo"):
                urls[page["title"]] = page["imageinfo"][0]["url"]
        time.sleep(1.5)
    return urls


def slug_speaker(speaker):
    import unicodedata
    ascii_form = unicodedata.normalize("NFD", speaker).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9]+", "-", ascii_form).strip("-").lower() or "anon"


def download(url, dest_raw, dest_mp3, tries=8):
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            data = urllib.request.urlopen(req, timeout=120).read()
            open(dest_raw, "wb").write(data)
            normalized = subprocess.run(
                ["ffmpeg", "-y", "-i", dest_raw, "-af",
                 "loudnorm=I=-18:TP=-2:LRA=11", "-ar", "44100", "-b:a", "128k", dest_mp3],
                capture_output=True, timeout=120,
            )
            os.remove(dest_raw)
            if normalized.returncode == 0 and os.path.getsize(dest_mp3) > 2000:
                return True
            if os.path.exists(dest_mp3):
                os.remove(dest_mp3)
            return False
        except urllib.error.HTTPError as error:
            if error.code == 429:
                retry_after = error.headers.get("Retry-After")
                wait = max(int(retry_after) if retry_after and retry_after.isdigit() else 0, 60)
                print(f"429 on download, waiting {wait}s", flush=True)
                time.sleep(wait)
            else:
                time.sleep(8 * (attempt + 1))
        except Exception:
            time.sleep(8 * (attempt + 1))
    if os.path.exists(dest_raw):
        os.remove(dest_raw)
    return False


index = json.load(open(f"{HARVEST}/audio-index.json"))
forms = dataset_forms()
state = load_state()
state.setdefault("urls", {})
os.makedirs(CANDIDATES, exist_ok=True)

for form in index:
    index[form] = sorted(index[form], key=lambda entry: preference_rank(entry["speaker"]))

pending = [f for f in forms if f in index and f not in state["done"]]
pending = pending[:max(0, TARGET_DONE - len(state["done"]))]
print(f"dataset forms: {len(forms)}, index-matched: {sum(1 for f in forms if f in index)}, pending: {len(pending)} (target {TARGET_DONE})", flush=True)

unresolved = []
for form in pending:
    for entry in index[form][:MAX_PER_FORM]:
        if entry["title"] not in state["urls"]:
            unresolved.append(entry["title"])
print(f"resolving {len(unresolved)} titles in {(len(unresolved) + 39) // 40} batches", flush=True)
for start in range(0, len(unresolved), 40):
    chunk = unresolved[start:start + 40]
    result = api({"action": "query", "prop": "imageinfo", "iiprop": "url", "titles": "|".join(chunk)})
    normalized = {}
    for page in (result or {}).get("query", {}).get("pages", {}).values():
        if page.get("title") and page.get("imageinfo"):
            normalized[page["title"]] = page["imageinfo"][0]["url"]
    for title in chunk:
        state["urls"][title] = normalized.get(title, "")
    save_state(state)
    print(f"resolved {start + len(chunk)}/{len(unresolved)}", flush=True)
    time.sleep(3)

for position, form in enumerate(pending):
    entries = index[form][:MAX_PER_FORM]
    got = []
    form_dir = f"{CANDIDATES}/{form}"
    os.makedirs(form_dir, exist_ok=True)
    for entry in entries:
        if got:
            break
        url = state["urls"].get(entry["title"])
        if not url:
            continue
        speaker = slug_speaker(entry["speaker"])
        extension = entry["title"].rsplit(".", 1)[-1].lower()
        dest_raw = f"{form_dir}/.{speaker}.{extension}"
        dest_mp3 = f"{form_dir}/{speaker}.mp3"
        if os.path.exists(dest_mp3):
            got.append(speaker)
            continue
        if download(url, dest_raw, dest_mp3):
            got.append(speaker)
        time.sleep(8)
    if got:
        state["done"][form] = got
    else:
        state["failed"][form] = len(entries)
    save_state(state)
    if (position + 1) % 20 == 0:
        print(f"[{position + 1}/{len(pending)}] done {len(state['done'])} failed {len(state['failed'])}", flush=True)

gaps = sorted(f for f in forms if f not in index)
json.dump({forms[f].split(".")[0] if False else f: forms[f] for f in gaps},
          open(f"{HARVEST}/word-gaps.json", "w"), ensure_ascii=False, indent=1)
print(f"COMPLETE: done {len(state['done'])}, failed {len(state['failed'])}, gaps(no-index) {len(gaps)} -> word-gaps.json", flush=True)
