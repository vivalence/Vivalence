#!/bin/bash
# PreToolUse[Write|Edit] — a write past a capped ikiro file's `limit: N chars` warns and lands (one loop: methods/cap.py --guard).
exec python3 "$(cd "$(dirname "$0")/.." && pwd)/methods/cap.py" --guard
