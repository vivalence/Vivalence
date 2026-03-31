# Topology Data Quality Criteria & Tooling

> Hard-won rules for literal entities in topology datasets. Every rule here exists because violating it produced a visible bug in the learner-facing UI. These are not style preferences — they are correctness criteria.

## Entity Shape

```javascript
{
  slug: "falar.verb.indicative.present.first.singular",
  traits: ["TRANSLATED", "EXEMPLIFIED", "RANKED", "VOCALIZED"],
  trait: {
    TRANSLATED: { known: "I speak", learning: "falo" },
    EXEMPLIFIED: { known: "I speak Portuguese", learning: "Eu falo português" },
    RANKED: { rank: 42, zipf: 6.1, fpm: 1250 },
    VOCALIZED: { asset: { path: "words/falo.mp3" } }
  },
  symbols: [
    { slug: "word" },
    { slug: "word.lemma.falar" },
    { slug: "word.part-of-speech.verb" },
    { slug: "word.suffix.ar" },
    { slug: "word.regularity.regular" },
    { slug: "word.verb-form.finite" },
    { slug: "word.mood.indicative" },
    { slug: "word.tense.present" },
    { slug: "word.person.first" },
    { slug: "word.number.singular" },
    { slug: "word.voice.active" },
    { slug: "proficiency.cefr.a1" },
    { slug: "proficiency.survival" }
  ]
}
```

Note: `symbols` is an **array of slug references** (not `symbol` singular). The SQL pivot for ConjugationEntity joins on these.

## TRANSLATED Trait

### `learning` (the Portuguese word)

- **Always lowercase.** Even if the word appears sentence-initially in examples. The learning field is the dictionary form, not a surface form. `"como"` not `"Como"`.
- **Must be the actual conjugated form**, not the infinitive. A flashcard for `falar.verb.indicative.present.first.singular` must show `"falo"`, not `"falar"`. The learner sees what they need to produce.
- **No duplicates by capitalization.** If `que.coordinating-conjunction` has learning `"que"`, do not create `que.pronoun` with learning `"Que"` just because it appeared uppercase in a sentence.

### `known` (the English translation)

- **Must be English.** No Portuguese diacritics (ã, ç, é, etc.) in the known field.
- **Must not equal learning** (unless legitimately the same word in both languages: "hospital", "animal", etc.).

#### Verb `known` conventions

| form | pattern | example |
|---|---|---|
| infinitive | `to [verb]` | `"to speak"` |
| imperative | `[verb]!` | `"speak!"` |
| gerund | `[verb]ing` | `"speaking"` |
| past participle | English past participle | `"spoken"`, `"bought"`, `"done"` |
| indicative 1sg | `I [conjugated]` | `"I speak"` |
| indicative 3sg | `he/she [conjugated]` | `"he/she speaks"` |
| indicative 1pl | `we [conjugated]` | `"we speak"` |
| indicative 3pl | `they [conjugated]` | `"they speak"` |
| imperfect 1sg | `I used to [verb]` or `I was [verb]ing` | `"I used to speak"` |
| conditional 1sg | `I would [verb]` | `"I would speak"` |
| conditional 3sg | `he/she would [verb]` | `"he/she would speak"` |
| subjunctive | `(that) I/he/she [verb]` | `"(that) I speak"` |

Impersonal verbs use `it` or `there`: `"it costs"`, `"it matters"`, `"there is/are"`.

The English **must be conjugated** — `"he/she bought"` not `"he/she buy"`. The person pronoun is mandatory for all person-specific forms. Without it, the learner cannot tell which conjugation the card is testing.

#### Non-verb `known` conventions

- Feminine adjective variants: add `(fem.)` — `"tired (fem.)"` for `cansada`
- Determiners: add gender — `"the (masc.)"`, `"a / an (fem.)"`
- Words with multiple meanings: use `/` — `"of / from"`, `"time / weather"`

## EXEMPLIFIED Trait

### The learning word must appear in the Portuguese example

If the entity's `learning` is `"falo"`, the example's `learning` (Portuguese sentence) must contain `"falo"`. No exceptions.

**Common violations:**
- Infinitive entities with conjugated examples: `learning="gostar"` but example says `"Gosto de comer"`. Fix: use a construction where the infinitive appears naturally — `"Quero gostar de legumes"` (after modal verbs: preciso, quero, posso, vou, devo, gosto de).
- Masculine adjective with feminine example: `learning="bom"` but example says `"A comida está boa"`. The gender must agree.

### The known word should appear in the English example

If known is `"how (interrogative)"`, the English example should contain "how", not "when". The example demonstrates the meaning the learner just learned.

**Acceptable exceptions:** function words where English grammar absorbs the preposition (`"gostar de"` → `"to like"`, the `"de"` disappears). In these cases prefer an example where the mapping is visible: `"Uma xícara de café"` / `"A cup of coffee"` for `de.adposition`.

### No lazy duplicate examples

Each entity needs its own example that demonstrates its specific meaning. Do not copy-paste the same example across multiple entities (e.g., 7 adpositions all saying "I am from Brazil").

## VOCALIZED Trait

### Audio must match learning form exactly

The mp3 file must pronounce the exact word in the `learning` field. If `learning="fui"`, the VOCALIZED path must decode to `"fui"`, not `"ser"` (the infinitive).

When changing the learning field (e.g., fixing infinitive→conjugated), check if VOCALIZED still matches. If not, either find the correct mp3 or remove VOCALIZED entirely.

### Mp3 must exist in the same kernel's freight

The path `words/veja.mp3` resolves relative to the kernel that owns the entity. If the entity is in survival, the mp3 must be in `english-to-brazilian-survival/freight/audio/words/veja.mp3`. Having it only in the vocalized kernel is not enough — the app won't find it.

### Suffix convention for diacritics in filenames

Filenames cannot contain diacritics. Use the suffix convention:

| diacritic | code | example |
|---|---|---|
| á, é, í, ó, ú | `-ac` (acute) | `café` → `cafe-ac.mp3` |
| â, ê, ô | `-cf` (circumflex) | `você` → `voce-cf.mp3` |
| ã, õ | `-tl` (tilde) | `não` → `na-tl-o.mp3` |
| ç | `-cd` (cedilla) | `começar` → `comec-cd-ar.mp3` |
| à | `-gv` (grave) | `à` → `a-gv.mp3` |

Rule: base letter stays, suffix follows, hyphen separates from next chars. The trailing hyphen after the code is consumed (not left dangling).

## RANKED Trait

Every entity must have `rank`, `zipf`, and `fpm` from wordfreq. Each conjugated form gets its **own** frequency data — look up the specific surface form (e.g., `fui`, not `ser`), not the lemma.

- `zipf`: `zipf_frequency(learning, 'pt')` from wordfreq
- `fpm`: `word_frequency(learning, 'pt') * 1e6`
- `rank`: `round(10 ** (9.0 - zipf))` — ordinal approximation (lower = more common)

This matters because conjugated forms vary wildly in frequency. `fui` (zipf 5.40) is ~30x more frequent than `fôramos` (zipf 2.1). The learner should encounter common forms first.

## Symbols

### Universal requirements (all entities)

| symbol | notes |
|---|---|
| `word` | root symbol, always present |
| `word.lemma.{lemma}` | the dictionary form |
| `word.part-of-speech.{pos}` | noun, verb, adjective, etc. |
| `proficiency.cefr.{level}` | a1, a2, b1, etc. |
| `proficiency.survival` | if in survival kernel |

### Verb-specific requirements

| symbol | when |
|---|---|
| `word.suffix.{ar\|er\|ir}` | always — conjugation class |
| `word.regularity.{regular\|irregular}` | always |
| `word.verb-form.{infinitive\|finite\|gerund\|participle}` | always |
| `word.mood.{indicative\|subjunctive\|imperative\|conditional}` | finite forms |
| `word.tense.{present\|past\|imperfect\|future}` | tenses forms |
| `word.person.{first\|second\|third}` | conjugated forms |
| `word.number.{singular\|plural}` | conjugated forms |
| `word.voice.active` | indicative, conditional, subjunctive |

### Adjective-specific

| symbol | when |
|---|---|
| `word.gender.feminine` | feminine variants (cansada, aberta, etc.) |
| `word.gender.masculine` | masculine forms |

### Why symbols matter

Symbols drive the ConjugationEntity SQL view — it pivots on `word.lemma`, `word.tense`, `word.mood`, `word.person`, `word.number` to build conjugation tables. Missing symbols = missing cells in the table. The `word.suffix` and `word.regularity` symbols enable filtering exercises by conjugation class and difficulty.

## Verb Slug Convention

```
{lemma}.verb.{mood}.{tense}.{person}.{number}
```

- Person BEFORE number: `first.singular` not `singular.first`
- Infinitive: `ser.verb.infinitive` (no tense/person/number)
- Gerund: `ser.verb.gerund`
- Past participle: `comprar.verb.participle.past`
- Imperative: `fazer.verb.imperative.present.third.singular`

## Survival vs A1 Boundary

**Survival** = reactive, transactional. The learner cannot speak the language and needs to physically function: navigate, order food, handle emergencies, basic greetings. Every word answers: "can I get through this situation right now?"

**A1** = proactive, conversational. The learner is studying the language and can participate in basic social life: talk about themselves, daily routines, preferences, simple opinions.

### The 14 survival verb set

Chosen for coverage of both communicative need and pedagogical balance:

| category | verbs | rationale |
|---|---|---|
| regular -ar | falar, precisar | pattern recognition: -o, -a, -amos, -am |
| regular -er | entender, comer | pattern recognition: -o, -e, -emos, -em |
| regular -ir | abrir, partir | pattern recognition: -o, -e, -imos, -em |
| irregular | ser, estar, ir, ter, poder, querer, saber, fazer | survival essentials |

Each has a complete present indicative paradigm (infinitive + 1sg + 3sg + 1pl + 3pl). Brazilian Portuguese uses 4 person/number slots — tu (2sg) and vós (2pl) are not used in standard Brazilian speech.

The 14 verbs were also migrated with their full conjugation tables (past, imperfect, conditional, subjunctive, imperative) from A1. All conjugations of these 14 lemmas live in survival.

## Tooling

Entity files are JavaScript (`export default [...]`) with mixed quoted/unquoted keys. They cannot be parsed as raw JSON. The following patterns were developed and battle-tested across 1200+ entities.

### Reading entity files (Python)

```python
import re, json

def read_entities(fpath):
    """Parse a topology literal JS file into a Python list of dicts."""
    with open(fpath) as f:
        content = f.read()
    raw = content.replace('export default ', '').rstrip().rstrip(';')
    # Quote bare JS keys (word-chars and hyphens before colons)
    raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
    # Remove trailing commas before } or ]
    raw = re.sub(r',(\s*[}\]])', r'\1', raw)
    return json.loads(raw)
```

This handles: bare keys (`slug:` → `"slug":`), trailing commas, and the `export default` wrapper. Works for both pretty-printed (survival) and minified (a1) files.

### Writing entity files

```python
def write_survival(fpath, entities):
    """Write pretty-printed (survival convention)."""
    body = json.dumps(entities, indent=2, ensure_ascii=False)
    with open(fpath, 'w') as f:
        f.write(f'export default {body}\n')

def write_a1(fpath, entities):
    """Write minified (a1 convention)."""
    body = json.dumps(entities, ensure_ascii=False)
    with open(fpath, 'w') as f:
        f.write(f'export default {body}\n')
```

Survival uses pretty-printed JSON. A1 uses minified. Preserve the convention when editing.

### Decoding diacritic-suffixed filenames

```python
DIAC = {
    'ac': {'a':'á','e':'é','i':'í','o':'ó','u':'ú'},
    'cf': {'a':'â','e':'ê','o':'ô'},
    'tl': {'a':'ã','o':'õ'},
    'cd': {'c':'ç'},
    'gv': {'a':'à'},
}

def decode_suffix(stem):
    """Decode a suffix-encoded filename back to the Portuguese form.
    e.g. 'cafe-ac' → 'café', 'na-tl-o' → 'não', 'comec-cd-ar' → 'começar'
    """
    result = stem.replace('.mp3', '')
    if result.startswith('words/'):
        result = result[6:]
    for code, mapping in DIAC.items():
        pat = re.compile(r'([a-zA-Z])-' + code + r'(?:-|$)')
        while True:
            m = pat.search(result)
            if not m:
                break
            if m.group(1).lower() not in mapping:
                break
            result = result[:m.start()] + mapping[m.group(1).lower()] + result[m.end():]
    return result
```

Critical detail: the regex uses `(?:-|$)` which **consumes** the trailing hyphen after the diacritic code. Using a lookahead `(?=-|$)` instead leaves a dangling hyphen and produces wrong results (e.g. `ajudarí-amos` instead of `ajudaríamos`).

### Building an mp3 lookup

```python
import os, unicodedata

def to_ascii(s):
    return unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower()

def build_mp3_lookup(freight_dir):
    """Map decoded Portuguese form → mp3 path for all files in a freight dir."""
    lookup = {}
    for f in os.listdir(freight_dir):
        if f.endswith('.mp3'):
            decoded = decode_suffix(f).lower()
            lookup[decoded] = f"words/{f}"
    return lookup
```

Use `to_ascii()` for comparison — it strips diacritics so `café` matches `cafe`. Always compare with `to_ascii(audio_form) != to_ascii(learning)` to catch encoding mismatches.

### Changeset pattern for bulk edits

For edits that require human judgment (e.g., English verb conjugation), don't apply computationally. Instead:

1. Generate a changeset JSON: `{ slug, current, proposed, changed, needs_review, reason }`
2. Apply mechanical fixes automatically (adding "I", "to", "!")
3. Flag anything requiring English conjugation or semantic judgment as `needs_review`
4. Manually correct all flagged entries in the changeset
5. Review the complete changeset before applying
6. Apply from the reviewed changeset in one pass

This caught errors like `"he/she buy"` (should be `"he/she bought"`) that a naive prefix-prepending approach would miss.

### Rank verification pass

When RANKED data is added or suspected of lemma contamination, verify all entries against wordfreq for the specific surface form:

```python
from wordfreq import zipf_frequency, word_frequency

for e in entities:
    learning = e["trait"]["TRANSLATED"]["learning"]
    ranked = e["trait"]["RANKED"]
    correct_zipf = round(zipf_frequency(learning, 'pt'), 2)
    correct_fpm = round(word_frequency(learning, 'pt') * 1e6, 1)
    correct_rank = round(10 ** (9.0 - correct_zipf)) if correct_zipf > 0 else 999999
    # Flag if zipf differs by >0.05 or rank differs by >10%
```

**Known failure mode**: when generating conjugation entries from a lemma template, rank/zipf/fpm get copied from the lemma instead of looked up per form. This makes all conjugations of `fazer` show rank 42 when `faz`=1380, `fazemos`=38905, `faço`=7413. The learner then gets rare forms mixed in with common ones. Always look up `zipf_frequency(conjugated_form, 'pt')`, never `zipf_frequency(lemma, 'pt')`.

## Quality Audit Checklist

Run before shipping any topology changes:

1. **No uppercase learning values** (sentence-initial capitalization leaking in)
2. **No learning=lemma on conjugated verbs** (infinitive used instead of conjugated form)
3. **No Portuguese in known fields** (diacritics = wrong language)
4. **No known=learning** (unless genuinely the same word in both languages)
5. **Learning appears in Portuguese example**
6. **Known word appears in English example** (or acceptable exception documented)
7. **Gender agrees between learning and example** (masculine word, masculine example)
8. **VOCALIZED path decodes to match learning** (not the infinitive)
9. **VOCALIZED mp3 exists in the entity's own kernel freight** (not just in vocalized kernel)
10. **RANKED populated** (rank, zipf, fpm) — **per-form, not per-lemma**
11. **No duplicate slugs**
12. **Symbols complete** per the tables above
13. **Verb known has person context** ("I/he/she/we/they" for conjugated, "to" for infinitive, "!" for imperative)
14. **Examples are unique per entity** (no copy-paste across multiple entities)
