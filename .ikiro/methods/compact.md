# the compact walk — deriving a compact instead of recalling one

beef: *"one thing thats annoying about the compact ritual is that it has a recency bias. work in a methodology that forces the agent to go message by message and section by section"*

## why the bias exists

A compact written **from context** cannot be even-handed. By fold time the early session has been summarized — or dropped — while the last few turns sit in the window verbatim. So the compact over-weights the end, and the parts most likely to be lost are the ones already hardest to see. Exhortation cannot fix this: "be thorough" is prose, and prose is not enforcement. The fix has to change the INPUT, not the intention.

**Do not recall the session. Read it.** The transcript is on disk at `~/.claude/projects/-Users-finn-vivalence-code-vivalence/<session-id>.jsonl`, complete and unsummarized, and it is uniformly detailed at both ends.

## the walk

1. **SPINE** — extract every beef turn in order, numbered `1..N`. Never from memory; run the extractor below. `N` is now a fact, and the walk has a denominator.
2. **WINDOWS** — walk **oldest first**, ~4 turns per window. Per turn write one row: `n · what beef asked (verbatim when it is a decision, a gate, or a correction) · what landed · what was decided or killed`.
3. **COVERAGE** — every `n` in `1..N` appears in exactly one row. A turn with nothing durable is written `NOTHING`, never skipped in silence. Unaccounted turns > 0 means the walk is not finished. This is the forcing function: the count exists before the writing starts, so a short walk is visibly short rather than plausibly complete.
4. **SECTIONS** — compose section by section (`#+TOPIC` · `* Arc` beats · failures · `* State at fold`), and fill **each section from the whole row table**. Never write the compact top-to-bottom in one pass: a single pass re-imposes narrative order, which is recency order wearing a different hat.
5. **BALANCE** — count which rows each section cites. If more than half the citations fall in the last third of `N`, the bias survived; go back to the rows. This is the measurable test, and it is the difference between a method and a wish.
6. **INDEX** — regenerate `compacts/index.md` (never hand-patch it). A compact nobody can find is not a record: measured once, **32 of 35 were unreachable from live canon**. The check is a count — numbered entries must equal `.org` files in the directory. Give the new compact a `#+filetags:` line or it enters the index untagged and findable only by number (12 of 35 are, today).
8. **QUEST REPORT** — `CLAUDE_SESSION_ID=<this session> python3 .ikiro/methods/quest-report.py --format md --stamp --compact <this compact>`: the five-column table lands as the compact's `* quest report` section and the three derived header keys are restamped on every live quest (totem: `self/totems.md ## quest report`). Read the `sessions` column before claiming anything about the tree — a live sibling means a shard or an hour-old grep can already be false.
7. **SETTLEMENT** — then the existing scribe pass (see `self/rituals.md ## the scribe's duties`): loose ends resolved by a landed rule get FIXED in the compact turn, budgets checked in chars, date-scan before writing.

## the extractor

```python
import json,os,sys,re,datetime
D=os.path.expanduser('~/.claude/projects/-Users-finn-vivalence-code-vivalence')
sid=sys.argv[1] if len(sys.argv)>1 else None
fp=os.path.join(D,sid+'.jsonl') if sid else max((os.path.join(D,f) for f in os.listdir(D) if f.endswith('.jsonl')),key=os.path.getmtime)
NOISE=re.compile(r'^<(local-command-caveat|command-name|command-message|command-args|system-reminder|local-command-stdout)|^# /\w+ —')
def when(s):
    try: return datetime.datetime.fromisoformat(s.replace('Z','+00:00')).timestamp()
    except: return 0.0
raw=[]
for i,line in enumerate(open(fp,encoding='utf-8',errors='replace')):
    try: e=json.loads(line)
    except: continue
    t=e.get('type'); ts=e.get('timestamp') or ''
    txt=None
    if t=='queue-operation' and e.get('content'): txt=e['content']          # MID-TURN
    elif t=='user':
        c=e.get('message',{}).get('content')
        if isinstance(c,str): txt=c
        elif isinstance(c,list): txt=' '.join(b.get('text','') for b in c if isinstance(b,dict) and b.get('type')=='text')
    if not txt or not txt.strip(): continue
    txt=txt.strip()
    if NOISE.match(txt): continue
    raw.append((i,ts,when(ts),t,txt))
turns=[]
for r in raw:
    if any(r[4][:200]==k[4][:200] and abs(r[2]-k[2])<180 for k in turns): continue
    turns.append(r)
print(f"BEEF TURNS: {len(turns)}  (raw {len(raw)}, {len(raw)-len(turns)} queue duplicates collapsed)")
for n,(i,ts,_,t,txt) in enumerate(turns,1):
    print(f"{n:3}. {ts[11:19]} {'MID-TURN' if t=='queue-operation' else 'prompt  '} [{len(txt):5}ch] {' '.join(txt.split())[:118]}")
```

## the index generator

```python
import os,re,collections
D='.ikiro/compacts'
files=sorted(f for f in os.listdir(D) if f.endswith('.org'))
tags=collections.defaultdict(list); notag=[]; slugs=[]
for i,f in enumerate(files,1):
    t=open(os.path.join(D,f),encoding='utf-8',errors='replace').read()
    slugs.append(os.path.splitext(f)[0])
    m=re.search(r'^#\+filetags:\s*(.+)$',t,re.M|re.I)          # lowercase in practice — match both
    if not m: notag.append(i); continue
    for tag in [x for x in m.group(1).strip().strip(':').split(':') if x]: tags[tag].append(i)
out=["# compacts — tag index","","## by tag",""]
for tag in sorted(tags, key=lambda t:(-len(tags[t]),t)):
    if len(tags[tag])>1: out.append(f"- **{tag}** — {', '.join(map(str,tags[tag]))}")
singles=sorted(t for t in tags if len(tags[t])==1)
out+=["", f"- *singletons* — {' · '.join(f'{t} {tags[t][0]}' for t in singles)}",""]
if notag: out.append(f"> UNTAGGED (findable only by number): {', '.join(map(str,notag))}\n")
out+=["## compacts",""] + [f"{i:2}. `{s}`" for i,s in enumerate(slugs,1)]
open(os.path.join(D,'index.md'),'w',encoding='utf-8').write('\n'.join(out)+'\n')
print(f"{len(files)} compacts · {len(tags)} tags · {len(notag)} untagged")
```

Keep the header prose of the existing `index.md` when regenerating — the script above emits the body. The check afterwards is one line: numbered entries must equal `.org` files.

## the canon path audit (world-sync step)

A **lead generator, never a verdict** — the same status the kernel gives a codemap claim. It flags container-rooted paths that live canon asserts as CURRENT but that do not exist on disk. Measured baseline: **56 raw → 25 after the three skip classes**, and the skips are what make it survivable.

An earlier general path-existence checker was built, measured at 7 false positives on a clean tree, and BINNED — correctly, because canon legitimately names things that are gone. The difference here is that the three reasons it legitimately does so are now classified rather than tripped over:

- **RECORDS assert the past, not the present.** `zettelkasten.md` (append-only Callouts), `loop-backlog.md`, `known-issues.org`, and everything under `compacts/` are out of scope by construction. A ledger entry describing a path that was wrong IS the record working.
- **Context marks it gone.** `emigrated · deleted · renamed · no longer · dead · slop · moved · superseded · gone · left · old`. Missing `gone` alone produced a false positive on `world/codemap/paladin.md`, on a line reading *"is GONE from every Dockerfile"* — the checker flagged the sentence that had already done its job.
- **Design that was never built.** `sketch · dormant · DESIGNED · planned · proposed · WITHDRAWN · deferred · parked`, plus a file-wide trip at 3+ such markers. `project_longdistance_audio_sketch` is seven paths of scaffolding that deliberately does not exist.

Suggest a successor only at **suffix depth ≥3, unique at that depth**. A unique BASENAME match is not identity — it proposed `systems/runtime/daemon/entities.js` → `registry/viva/lighthouse/multiplayer/server/entities.js`, and `daemon/kernel.js` → `schematics/primitives/kernel.js`. A wrong repoint is worse than a stale path: it reads as freshly verified.

```python
import os,re,collections
PATH=re.compile(r'`((?:systems|subsystems|registry|testament|documentation|docs)/[A-Za-z0-9_@./-]+)`')
GONE=re.compile(r'\b(emigrat|deleted|removed|renamed|no longer|used to|dead|slop|moved|replaced|former|superseded|pre-M11|was at|killed|dissolv|gone|left|old)\w*',re.I)
DESIGN=re.compile(r'\b(sketch|dormant|DESIGNED|not built|planned|proposed|WITHDRAWN|deferred|parked)\w*',re.I)
RECORDS={'zettelkasten.md','loop-backlog.md','known-issues.org'}
MEM=os.path.expanduser('~/.claude/projects/-Users-finn-vivalence-code-vivalence/memory')
srcs=[os.path.join(MEM,f) for f in sorted(os.listdir(MEM)) if f.endswith('.md')]
for root,d,fs in os.walk('.ikiro'):
    if '/compacts' in root: continue
    srcs+=[os.path.join(root,f) for f in fs if f.endswith(('.md','.org')) and f not in RECORDS]
for sp in srcs:
    t=open(sp,encoding='utf-8',errors='replace').read(); wide=len(DESIGN.findall(t))>=3
    for m in PATH.finditer(t):
        p=m.group(1).rstrip('/.')
        if os.path.exists(p) or re.search(r'<|\.\.\.|\*|\{',p): continue
        ctx=' '.join(t[max(0,m.start()-160):m.end()+160].split())
        if GONE.search(ctx) or DESIGN.search(ctx) or wide: continue
        print(f"{os.path.basename(sp):46} {p}")
```

## three traps, all hit while building this

- **Mid-turn interjections are `type: "queue-operation"`, not `user`.** A walk over `user` messages misses them entirely — and in the session that produced this method, the two most consequential instructions were both mid-turn (*"can you add a hook to /compact?"* and *"kill it. move the meta information about how to rebuild the history into m31 root"*). A compact built from a `user`-only walk would have recorded neither, while still looking complete. This is a SECOND bias, sharper than recency: whole instructions are structurally invisible.
- **Dedupe must be time-windowed, never content-keyed.** Each queued message appears twice (~20 s apart). Keying on content alone collapsed five identical cron-fired prompts into one and cut a 12-turn session to 8 — the naive fix silently deleted four iterations of work. Match on content **within 180 s**.
- **A quoted turn's payload is its TAIL.** beef often pastes my own text back with the instruction appended — *"…deletion isn't git-reversible — the kernel's* **which 372k?**" and *"…5,333 lines git: A* **kill it.**". The quoted block is the address; the last clause is the order. Reading such a turn as a comment on my text, rather than as an instruction, loses the instruction.

## the denominator is the point

Every failure this method prevents has the same shape: the walk looked done because nothing said how much there was. `N` first, rows second, prose last.
