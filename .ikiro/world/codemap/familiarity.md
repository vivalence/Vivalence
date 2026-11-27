<!-- writer: agent · limit: 3400 chars · launch (no paths:) · his familiarity with each concept and entity; read before anything is shown to him -->
# familiarity — what he knows, so a show strikes relevance · importance · familiarity

## the eight levels

| n | state | what a show does with it |
|---|---|---|
| 0 | unseen | what it is in one sentence, its data shape, its whole code, one real value |
| 1 | named | what it is for, its whole code, one real value |
| 2 | placed | its signature and its effect, one line on why it is here |
| 3 | traced | its signature only |
| 4 | known | its name, nothing under it |
| 5 | fluent | its name, nothing under it |
| 6 | ruled | not shown unless it changes; then the diff alone |
| 7 | own | never shown, never explained |

0 never met · 1 knows the word · 2 knows where it sits and what it is for · 3 followed its flow once ·
4 knows its surface · 5 knows its insides · 6 he set its shape · 7 his own words or code.

## rules

- A level is his word, or his use of the thing. Never my guess, never an amen.
- A thing not listed is level 2 until he speaks.
- A stop spends its lines on what is low here and carries the change. What is 4 and up is a bare name.
- A low thing a stop or a rename table leans on is shown as its code before it, never after.
- `i dont understand X` · `what is X`: X drops to 0. `i know X` · he explains X · he rules X: X rises.

## the map

```jsonc
{
  // typology
  "v (schematics library)": 7,
  "Vector: open · branch · graft · use": 6,
  "a trait is cast once · thread traits HARNESSED · CONVERSATIONAL · TOOLED · PRIMED": 6,
  "TIERS · Tier · tune": 5,
  "Role: system · user · assistant": 6,
  "Selector": 2,
  "Queue (enqueue · drain; a mode pulls it)": 6,
  "Pipe · Span": 2,
  "Twitch dispatch: awaited, shotguns, returns nothing": 5,
  "Part kinds · the alien part": 3,
  "Request.bytes() (a body's exact bytes, read once)": 6,
  "cortex (Vector of avenues)": 2,
  "Thread.parent · children": 2,
  "Buffer attached to turns (m:n)": 2,
  "Turn.history · chain: one thread, by time": 1,
  "Packet · soma.pour · soma.transcript": 1,
  "belt/soma.js: drain · merge": 0,
  "belt/hallucinate.js: executors · meter · respond": 0,
  "shard/hal.js · shard/hallucinate.js": 0,
  "the datamap's thread scope on a request": 1,

  // paladin
  "embed: the viva link, the opentui shim": 6,
  "which instance a command acts on · instance/use --ledger": 0,
  "the canonical ledger recipe (commons/ledger)": 0,
  "hold: a form in a footer, history kept": 6,
  "lighthouse signup · signin by params": 6,
  "an instance folder as a compose project": 6,
  "the belt: read write remove link find hash watch bundle vcs envfile vault": 6,
  "a belt file: one bound closure, leaves inline, no comments": 6,
  "ledger.locks by set · telemetry.log": 6,
  "Registry as two subjects · bundle's two return shapes": 1,

  // runtime
  "ATTACHED on a service (a route with no login)": 5,
  "TOOLED · PRIMED mask starters": 4,
  "ctx.providers.<key> (a consumed service)": 3,
  "one module hosted in services[] and consumed": 3,
  "the hallucination architecture: faculty → cortex → avenue → belt → trait": 1,
  "Audio.Packet (live audio on a stream; never a part)": 0,
  "Channel grammar · channels.<via>.via": 6,
  "a render: turns in, a turn out, every faculty": 6,
  "belt/channel.js: match · lower · take · give": 3,
  "a fault's kind on /response/close": 0,
  "harness filing: handed · filed": 4,
  "harness as api: ctx.mode.harness.dialogue.stream": 5,
  "the primer: sections · five writers · PRIMED": 0,
  "thread called = director, child = actor; /actor · /director": 6,
  "harness.js inside: claiming · requesting · chaining · composing": 0,
  "gestalten.shard.hallucination: activating · narrating · persisting": 0,
  "actorThread · directorThread, the conversation its own vector": 6,
  "conversation.js: direct · carry": 2,
  "conversation.js: conversing · voiced · reply · acting": 1,

  // clients
  "dock · terminal · activities": 6,
  "a HOME reference": 0,
  "SURFACED · surfaces: stored, bundled, framed": 5,

  // commons/social
  "Message · About (commons/social/schematics.js)": 6,
  "the waterfall of 11 steps (whatsapp-agent)": 6,
  "the WhatsApp hook: one URL, challenge GET, signed POST": 3,
  "heard · provider · the two masks · the bot's twitch": 3,
  "statics.users on the bot mode: address → user slug": 6,
  "a service's aperture · EXPOSED on a service (aperture before tools)": 6,
  "whatsapp graph.js: graph · meta": 2,
  "Meta's two levels: the app (one callback) · a number (its own override)": 2,
  "a service hosted and consumed: two masks, one module": 2,
  "the bot's own number on its consumed entry": 4,
  "a delivery sorted by the number it was sent to · numbers": 2,

  // release
  "vYYYY.MM.N rolling · vN.N.N LTS · a cut file per release": 7,
  "the root deno.jsonc version: the tag echoes it, a mount is stamped by it": 2,
  "jj describe · new · tag set, git push <remote> <tag>": 3
}
```
