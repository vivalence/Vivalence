#!/usr/bin/env python3
"""walk — a session's transcript oldest-first: each of his turns, then the reply's head, tail and tool calls.

    python3 .ikiro/methods/walk.py ~/.claude/projects/<slug>/<id>.jsonl     # fold step 1 reads THIS, never recall

A mid-turn message of his rides a tool result, not a turn: grep the jsonl for it by its words.
"""
import json
import sys

turn = 0
with open(sys.argv[1]) as handle:
    for row in handle:
        try:
            entry = json.loads(row)
        except ValueError:
            continue
        kind = entry.get("type")
        content = (entry.get("message") or {}).get("content")
        if kind == "user":
            if isinstance(content, str):
                texts = [content]
            else:
                texts = [part.get("text", "") for part in (content or []) if part.get("type") == "text"]
            for text in texts:
                if not text.strip() or text.startswith("Base directory for this skill"):
                    continue
                if "<system-reminder>" in text[:40]:
                    continue
                turn += 1
                print(f"\n##### HIS {turn} [{entry.get('timestamp', '')}]\n{text[:900]}")
        elif kind == "assistant":
            for part in content or []:
                if part.get("type") == "text" and part.get("text", "").strip():
                    text = part["text"]
                    print(f"\n----- MINE ({len(text)} chars)\n{text[:500]}")
                    if len(text) > 900:
                        print(f"   […]\n{text[-350:]}")
                elif part.get("type") == "tool_use":
                    spec = part.get("input", {})
                    label = spec.get("description") or spec.get("file_path") or spec.get("skill") or ""
                    print(f"   · {part.get('name')} {label[:90]}")
