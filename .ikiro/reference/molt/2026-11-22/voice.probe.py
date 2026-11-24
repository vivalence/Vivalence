#!/usr/bin/env python3
"""voice.probe — what beef says and what the agent runs, off the transcripts. Read-only."""
import collections
import glob
import json
import os
import re
import statistics

PROJECT = os.path.expanduser("~/.claude/projects/-Users-finn-vivalence-code-vivalence")

CODEWORDS = {
    "go": r"\bgo\b",
    "amen": r"\bamen\b",
    "land": r"\bland\b",
    "fold": r"\bfold\b",
    "unfold": r"\bunfold\b",
    "blast": r"\bblast\b",
    "cast to quest": r"cast (it |this |that )?(in)?to (the )?quest",
    "fixate": r"\bfixate\b",
    "cleanup": r"\bclean ?up\b",
    "study": r"\bstudy\b",
    "investigate": r"\binvestigate\b",
    "research": r"\bresearch\b",
    "drill": r"\bdrill",
    "show me": r"\bshow[- ]me\b",
    "bird": r"\bbird",
    "connoisseur": r"\bconn?oiss?eur",
    "quest": r"\bquest\b",
    "milestone": r"\bmilestone",
    "critical pass": r"critical pass|another pass",
    "walk": r"\bwalk\b",
    "probe": r"\bprobe\b",
    "prototype": r"\bprototype",
    "snapshot": r"\bsnapshot",
    "short answers": r"\bshort\b|\bshorter\b|\bbrief",
    "simple words": r"simple words|speak english|plain english",
    "flat/formatting": r"\bflat\b|\bformatting\b",
    "versions": r"\bversions\b",
    "yes no": r"yes\s*(/|or)?\s*no\b",
    "ikiro": r"\bikiro\b",
    "mark": r"\bmark\b",
    "prune": r"\bprune\b",
    "molt/selfimprove": r"\bmolt\b|self.?improve",
    "known issue": r"known issue",
    "compact": r"\bcompact\b",
    "hook/guard": r"\bhooks?\b|\bguards?\b",
    "skill": r"\bskills?\b",
    "agent": r"\bagents?\b",
    "workflow": r"\bworkflow",
    "coherent": r"\bcoheren",
    "simple": r"\bsimple\b|\bsimpler\b|\bsimplify",
    "truth": r"\btruth\b|\btrue\b",
    "inline": r"\binline\b",
    "cut": r"\bcut\b",
    "why": r"^\s*why\b",
    "diff": r"\bdiff\b",
    "screenshot": r"\[image|screenshot",
    "tangle": r"\btangle",
    "handoff": r"\bhandoff",
    "frontier": r"\bfrontier\b",
    "holy": r"\bholy\b",
    "sibling": r"\bsibling",
    "caveman": r"\bcaveman\b",
}

THEMES = {
    "verbosity": r"\byap|too long|shorter|too much text|wall of|tl;?dr|too detailed|too fat|verbose|buried",
    "asking": r"stop asking|why (are you )?waiting|just do|don'?t ask|did i ask",
    "overreach": r"did i (fucking )?(say|tell)|i did ?n.?t (say|ask|tell)|revert|not what i (said|asked|meant)|who told you",
    "naming": r"call it|by its (fucking )?name|wrong word|what did we call|there is no ",
    "format": r"\bformat|\btable\b|\bflat\b|\bnest|fence|split .*code",
    "comprehension": r"don'?t understand|means what|speak english|simple words|this tells me no|what\?\s*$|^what\s*$",
    "silence": r"what are you doing|still (doing|running)|taking so long|\bstuck\b|\bhang",
    "complexity": r"too complex|overengineer|clever|not needed|why is there|more logic than|dedicated|be simple|be direct",
    "false claim": r"\bwrong\b|\bfalse\b|not true|that'?s not|incorrect|you said|you claimed|bullshit|\blie\b|\blying",
    "repeat": r"\bagain\b|i (already )?told you|how many times|still\.|i said",
    "missed code": r"show me (the )?code|where is the code|no code|code\?",
}

STOP = set("""a an the and or but if then so of to in on at for with from by is are was were be been it its this that
these those i you we he they me my your our not no do does did dont don't can cant will would should could just
as into out up down over have has had what why how when where which who there here also too very more than them
him his her she us am yes ok like one all any some need want get got make let now still""".split())

CORRECTION = re.compile(
    r"\bretard|i don'?t understand|\bwtf\b|\bfuck|^\s*no[.!]|^\s*(stop|sotp|wait)\b|\b[A-Z]{4,}(?:\s+[A-Z]{2,}){2,}",
    re.I | re.M,
)
RAGE = re.compile(r"\bretard|i don'?t understand|\bwtf\b|\bfuck|^\s*no[.!]|^\s*(stop|sotp|wait)\b", re.I | re.M)
CAPS = re.compile(r"\b[A-Z]{4,}(?:\s+[A-Z]{2,}){2,}")
REMINDER = re.compile(r"<system-reminder>.*?</system-reminder>", re.S)
COMMAND = re.compile(r"<command-name>(/[\w:-]+)</command-name>")
CD = re.compile(r"^\s*cd\s+\S+\s*(&&|;)\s*")
ENV = re.compile(r"^\s*(\w+=\S+\s+)+")


def text_of(message):
    content = message.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(p.get("text", "") for p in content if isinstance(p, dict) and p.get("type") == "text")
    return ""


def head_word(command):
    command = CD.sub("", command)
    command = ENV.sub("", command)
    words = command.split()
    if not words:
        return "?"
    first = os.path.basename(words[0])
    if first in ("git", "jj", "deno", "python3", "viva", "docker", "ssh", "sh", "bash") and len(words) > 1:
        return f"{first} {os.path.basename(words[1])[:24]}"
    return first


def main():
    turns = []
    slash = collections.Counter()
    tools = collections.Counter()
    bash = collections.Counter()
    agents = collections.Counter()
    skills = collections.Counter()
    assistant_chars = []
    for path in sorted(glob.glob(f"{PROJECT}/*.jsonl")):
        with open(path, encoding="utf-8", errors="replace") as fh:
            for raw in fh:
                if '"type":"user"' not in raw and '"type":"assistant"' not in raw:
                    continue
                try:
                    row = json.loads(raw)
                except json.JSONDecodeError:
                    continue
                if row.get("isSidechain"):
                    continue
                message = row.get("message") or {}
                if row.get("type") == "user":
                    text = text_of(message)
                    for name in COMMAND.findall(text):
                        slash[name] += 1
                    if row.get("isMeta"):
                        continue
                    text = REMINDER.sub("", text).strip()
                    if not text or text.startswith("<"):
                        continue
                    turns.append(text)
                else:
                    said = 0
                    for part in message.get("content") or []:
                        if not isinstance(part, dict):
                            continue
                        if part.get("type") == "text":
                            said += len(part.get("text", ""))
                        if part.get("type") != "tool_use":
                            continue
                        name = part.get("name", "?")
                        tools[name] += 1
                        given = part.get("input") or {}
                        if name == "Bash":
                            bash[head_word(given.get("command", ""))] += 1
                        if name in ("Agent", "Task"):
                            agents[given.get("subagent_type", "default")] += 1
                        if name == "Skill":
                            skills[given.get("skill", "?")] += 1
                    if said:
                        assistant_chars.append(said)

    typed = [t for t in turns if len(t) < 2500]
    print(f"# voice — {len(turns)} turns of his · {len(typed)} typed (<2500 chars)")
    lengths = sorted(len(t) for t in typed)
    print(f"his turn chars: median {statistics.median(lengths)} · p90 {lengths[int(len(lengths) * 0.9)]}")
    replies = sorted(assistant_chars)
    print(f"my text block chars: median {statistics.median(replies)} · p90 {replies[int(len(replies) * 0.9)]} · n {len(replies)}")

    print("\n## codewords — turns holding the word")
    counted = collections.Counter()
    for name, pattern in CODEWORDS.items():
        compiled = re.compile(pattern, re.I | re.M)
        counted[name] = sum(1 for t in typed if compiled.search(t))
    for name, n in counted.most_common():
        print(f"{n:5d}  {name}")

    print("\n## his openers — first word of a turn")
    openers = collections.Counter(re.split(r"[\s.,!?]+", t.lower(), 1)[0] for t in typed)
    for word, n in openers.most_common(45):
        print(f"{n:5d}  {word}")

    print("\n## whole short turns (<=4 words)")
    short = collections.Counter(re.sub(r"[.!?]+$", "", t.lower().strip()) for t in typed if len(t.split()) <= 4)
    for word, n in short.most_common(45):
        print(f"{n:5d}  {word}")

    corrections = [t for t in typed if RAGE.search(t) or CAPS.search(t)]
    if os.environ.get("CORRECTIONS"):
        for t in corrections:
            if len(t) < 700:
                print("·", " ⏎ ".join(t.split("\n"))[:420])
        return
    print(f"\n## correction themes — {len(corrections)} correction turns")
    themed = collections.Counter()
    unthemed = 0
    for t in corrections:
        hit = False
        for name, pattern in THEMES.items():
            if re.search(pattern, t, re.I | re.M):
                themed[name] += 1
                hit = True
        if not hit:
            unthemed += 1
    for name, n in themed.most_common():
        print(f"{n:5d}  {name}")
    print(f"{unthemed:5d}  (no theme matched)")

    print("\n## correction turns — top bigrams")
    bigrams = collections.Counter()
    for t in corrections:
        words = [w for w in re.findall(r"[a-z']+", t.lower()) if w not in STOP and len(w) > 2]
        bigrams.update(zip(words, words[1:]))
    for (a, b), n in bigrams.most_common(50):
        print(f"{n:5d}  {a} {b}")

    print("\n## slash commands")
    for name, n in slash.most_common(40):
        print(f"{n:5d}  {name}")

    print("\n## tools")
    for name, n in tools.most_common(40):
        print(f"{n:6d}  {name}")

    print("\n## bash heads")
    for name, n in bash.most_common(60):
        print(f"{n:6d}  {name}")

    print("\n## agents by type")
    for name, n in agents.most_common():
        print(f"{n:5d}  {name}")

    print("\n## skills by Skill tool")
    for name, n in skills.most_common():
        print(f"{n:5d}  {name}")


main()
