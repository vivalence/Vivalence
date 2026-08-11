#!/bin/bash
# family:assume-dont-verify — the HOOK rung. n=16, FAILED x5, escalation flagged 07-31 / 08-10 / 08-12
# and never acted on because the family looked unmechanizable: it lives in prose, not in file edits.
# Stop hooks get `last_assistant_message` AND `tool_calls`, so it IS mechanizable.
#
# The gate is deliberately NARROW so it stays high-precision: it fires only when the turn
# asserts an EMPTINESS, a BOUNDED-POSITIVE, or a COMPLETION and produced no evidence-bearing
# tool call in that same turn. Claiming "zero call sites" without having looked this turn is
# the exact shape of all five recorded failures (07-11 attribution, 07-12 scoped-search,
# 07-31 inferred emptiness, 08-10 store-state from a writer grep, 08-12 count + self-doc).
#
# One-shot per prompt_id: it can never deadlock a turn, only force one restatement with evidence.
input=$(cat)

msg=$(jq -r '.last_assistant_message // empty' <<<"$input")
prompt_id=$(jq -r '.prompt_id // "noprompt"' <<<"$input")
tools=$(jq -r '[.tool_calls[]?.tool_name] | join(" ")' <<<"$input")

[ -n "$msg" ] || exit 0

# Browser observation IS measurement — omitting the chrome tools fired on two turns that had
# read the live DOM. `Agent` is deliberately NOT evidence: a subagent's report is a claim I
# inherited, not one I measured, and subagents have reported wrong results before.
evidence=$(grep -coE '\b(Bash|Grep|Glob|Read|WebFetch|NotebookRead|mcp__semble__search|mcp__semble__find_related|mcp__claude-in-chrome__[a-z_]+)\b' <<<"$tools")
[ "$evidence" -gt 0 ] && exit 0

# Code is not a claim. A fenced block or an inline span can contain `no hash`, `is [empty]`,
# `verified` as an identifier — matching them measured my formatting, not my assertions.
# Calibrated against 660 real turns: stripping code removed every code-shaped false positive.
# Inline code becomes a placeholder, never nothing: deleting it CLOSES the {0,40} proximity
# window and manufactures matches that the raw text never had (measured — it tripled the rate).
# A quoted span is someone else's words or my own claim being RETRACTED — "hashing VERIFIED
# DEAD" fired the gate inside the sentence that withdrew it. Quotes become placeholders too.
prose=$(awk '/^[[:space:]]*```/{f=!f; next} !f' <<<"$msg" \
        | sed -E 's/`[^`]*`/ SYMBOL /g; s/"[^"]*"/ QUOTED /g')

# Negations are the opposite of the offence: "I haven't verified it" is the disclosure the
# family exists to produce. Never gate the sentence that admits the gap.
prose=$(grep -viE "\b(haven'?t|have not|had not|hadn'?t|not yet|cannot|can'?t|could not|couldn'?t|un)[[:space:]-]*(verified|confirmed|measured|checked)\b|\bunverified\b|\bwithout verifying\b" <<<"$prose")

emptiness='\b(zero|no|none|nothing|not a single)\b[^.]{0,40}\b(references?|call ?sites?|consumers?|hits?|matches?|results?|occurrences?|rows?|entries|usages?|instances?)\b'
# The copula form (`X is empty` / `is dead` / `is gone`) was measured at 5 false positives to 2
# true across 663 turns — it fires on design prose ("the bag is empty" means a SEMANTIC, not a
# measurement). Cut to the shapes that only ever assert a measured absence.
emptiness2='\bdoes ?n.t exist\b|\bdo(es)? not exist\b|\b(is|are|was|were)[[:space:]]+(unused|orphaned)\b|\bno (call ?sites?|consumers?|references?)\b'
# `bounded` is dropped: 0 true positives, 2 false, across the same 663 turns. Restore only with
# a tighter subject test — an unearned pattern is how a gate gets switched off wholesale.
completion='\ball (tests|suites|checks) pass\b|\bverified\b|\bit works\b'

hits=$(grep -inE "$emptiness|$emptiness2|$completion" <<<"$prose" | head -5)

[ -n "$hits" ] || exit 0

stamp="${TMPDIR:-/tmp}/ikiro-claim-guard/${prompt_id}"
mkdir -p "$(dirname "$stamp")"
[ -f "$stamp" ] && exit 0
: > "$stamp"

cat >&2 <<GATE
assume-dont-verify gate (family n=16, FAILED x5, largest on the board).

This turn asserts an emptiness / a bounded count / a completion, and ran NO
evidence-bearing tool call (Bash, Grep, Glob, Read, WebFetch, semble) to back it:

$hits

A ZERO IS A CLAIM. So is "the only one", and so is "verified".
Measure it in THIS turn and paste the envelope, or say plainly that the claim is
carried from an earlier turn and name which. Do not restate it unchanged.

Three axes recurrence proved the prose rule does not cover:
  PERSISTED STATE  - settle by querying the store, never by grepping the writer.
  SELF-SCOPED      - a grep narrowed to where you expect consumers measures the assumption.
  MECHANISM        - a *why* narrated beside a measured *what* inherits credibility unearned.
GATE
exit 2
