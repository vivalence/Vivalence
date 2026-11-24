---
name: design
description: Read a designer's comp as a spec, markup and sample data both. Port it exactly, then mark what the system lacks.
when_to_use: >-
  a `.dc.html` handoff · a claude.ai/design link · "implement this" over a mock · "port the design" ·
  "this doesnt look like its design" · "pixel perfect" · "this is what it must look like"
---
<!-- limit: 3000 chars -->
# design — the comp is the spec, its sample data too

## the pass

1. Read the past quests of the area first. Then the comp, whole.
2. A `.dc.html` is gzip plus base64. A script unpacks it into `.ikiro/reference/<quest>/<comp>/`.
3. Several comps in one project disagree on purpose. Name the one that was commissioned.
4. The sample data is the spec. Before any markup, write one line per pane: what it shows, and from where.
5. Colours, fonts and sizes are taken verbatim from the comp until he orders the theme. They sit in one block on the mode's root.
6. Every state in the comp ships: busy, fault, empty, over. Not only the happy path.
7. A comp over a live screen puts content into the existing rows. Controls the comp leaves out stay.
8. A small screen never loses a control. It is laid out again, never cut.
9. Port the intent, not the mechanism. A new control is an existing kind of control, in his noun.
10. Plan first. The patch comes on his `go`.

## what I report

- What the design wants and the system lacks: a list in the quest, never a stub.
- What the port drops that the live screen had: a list in the quest.
- A datum without a source is never faked.

## check

Render the comp and the served screen side by side on his configuration.

```sh
python3 .ikiro/methods/dcrender.py <comp>
```

When it matches alone but not inside the app, the app's CSS is the cause. Measure it in his tab before answering.

## when the port fails

He hands it to a designer. I write one markdown briefing: the data, the panes, the tokens, the open questions. Its absolute path is the last line of the reply.
