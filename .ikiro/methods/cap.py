#!/usr/bin/env python3
"""cap — every live ikiro file measured in CHARACTERS against its `limit: N chars` header.

    python3 .ikiro/methods/cap.py            # OVER and NOLIMIT rows only, exit 1 on any
    python3 .ikiro/methods/cap.py --all      # every capped file: chars / limit
    python3 .ikiro/methods/cap.py --guard    # PreToolUse[Write|Edit] body: reads the hook JSON on stdin,
                                             # warns on a write whose RESULT would exceed the file's limit

Capped: ikiro.md · self.md · connoisseur.md · manual.md · README.md · known-issues.org · release.md ·
world/**/*.md · skills/*/SKILL.md. Quests and reference/ are content, never capped.
Over cap the write warns and lands (beef: warn, no interrupt); the file is consolidated in the same turn. Nothing is evicted elsewhere.
"""
import glob, json, os, re, sys

ROOT = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR", "."), ".ikiro")
LIMIT = re.compile(r"limit: (\d+) chars")


def capped():
    files = (glob.glob(f"{ROOT}/*.md") + glob.glob(f"{ROOT}/*.org")
             + glob.glob(f"{ROOT}/world/**/*.md", recursive=True) + glob.glob(f"{ROOT}/skills/*/SKILL.md"))
    return sorted(f for f in set(files) if not os.path.islink(f))


def is_capped(path):
    path = os.path.abspath(path)
    return path in {os.path.abspath(f) for f in capped()} or (
        path.startswith(os.path.abspath(ROOT) + os.sep)
        and not any(seg in path for seg in ("/quests/", "/reference/", "/hooks/", "/methods/"))
        and path.endswith((".md", ".org")))


def limit_of(text):
    m = LIMIT.search(text[:4000])
    return int(m.group(1)) if m else None


def measure(show_all):
    bad = 0
    for f in capped():
        text = open(f, encoding="utf-8").read()
        n, lim = len(text), limit_of(text)
        rel = os.path.relpath(f, ROOT)
        if lim is None:
            print(f"NOLIMIT {rel} {n}"); bad = 1
        elif n > lim:
            print(f"OVER {rel} {n}/{lim}"); bad = 1
        elif show_all:
            print(f"ok {rel} {n}/{lim}")
    return bad


def guard():
    hook = json.load(sys.stdin)
    tool, inp = hook.get("tool_name"), hook.get("tool_input", {})
    path = inp.get("file_path", "")
    if tool not in ("Write", "Edit") or not is_capped(path):
        return
    current = open(path, encoding="utf-8").read() if os.path.exists(path) else ""
    if tool == "Write":
        result = inp.get("content", "")
    else:
        old, new = inp.get("old_string", ""), inp.get("new_string", "")
        times = current.count(old) if inp.get("replace_all") else 1
        result_len = len(current) - len(old) * times + len(new) * times
        result = current[:0]
        lim = limit_of(current)
        if lim is not None and result_len > lim:
            deny(path, result_len, lim)
        return
    lim = limit_of(result) or limit_of(current)
    if lim is None:
        deny(path, len(result), None)
    elif len(result) > lim:
        deny(path, len(result), lim)


def deny(path, n, lim):
    rel = os.path.relpath(path, ROOT)
    reason = (f"cap-guard: {rel} would be {n} chars over its limit {lim} — consolidate, do not evict"
              if lim else f"cap-guard: {rel} carries no `limit: N chars` header")
    mode = os.environ.get("IKIRO_GUARD_MODE", "warn")
    log = os.path.expanduser("~/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log")
    try:
        with open(log, "a") as fh:
            fh.write(f"{int(__import__('time').time())} cap-guard {mode} {rel} {n}/{lim}\n")
    except OSError:
        pass
    if mode == "warn":
        print(reason, file=sys.stderr); return
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny",
                                             "permissionDecisionReason": reason}}))


if __name__ == "__main__":
    if "--guard" in sys.argv:
        guard()
    else:
        sys.exit(measure("--all" in sys.argv))
