import json
import re
import time
import urllib.parse
import urllib.request

HARVEST = "/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest"
UA = "vivalence-harvester/0.1"
CATEGORIES = ["Lingua Libre pronunciation-ita", "Italian pronunciation"]

LL = re.compile(r"^File:LL-Q652 \(ita\)-(.+?)-(.+)\.(wav|ogg|oga|flac|mp3)$", re.I)
WIKT = re.compile(r"^File:It-(.+)\.(ogg|oga)$", re.I)


def api(params, tries=5):
    qs = urllib.parse.urlencode({"format": "json", **params})
    for attempt in range(tries):
        try:
            req = urllib.request.Request(f"https://commons.wikimedia.org/w/api.php?{qs}", headers={"User-Agent": UA})
            return json.load(urllib.request.urlopen(req, timeout=60))
        except Exception:
            time.sleep(5 * (attempt + 1))
    return None


index = {}


def add(form, speaker, title):
    key = form.strip().lower()
    index.setdefault(key, []).append({"speaker": speaker, "title": title})


total = 0
for category in CATEGORIES:
    cont = {}
    pages = 0
    while True:
        result = api({
            "action": "query", "list": "categorymembers", "cmtype": "file",
            "cmlimit": "500", "cmtitle": f"Category:{category}", **cont,
        })
        if not result:
            print(f"FAILED page {pages} of {category}", flush=True)
            break
        for member in result["query"]["categorymembers"]:
            title = member["title"]
            total += 1
            m = LL.match(title)
            if m:
                add(m.group(2), m.group(1), title)
                continue
            m = WIKT.match(title)
            if m:
                add(m.group(1), "wiktionary", title)
        pages += 1
        print(f"{category}: page {pages}, files {total}, forms {len(index)}", flush=True)
        if "continue" in result:
            cont = {"cmcontinue": result["continue"]["cmcontinue"]}
            time.sleep(2)
        else:
            break

json.dump(index, open(f"{HARVEST}/audio-index.json", "w"), ensure_ascii=False, indent=1)
print(f"DONE: {total} files, {len(index)} distinct forms -> audio-index.json", flush=True)
