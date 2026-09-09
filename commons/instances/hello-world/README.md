# hello-world

The demo mode. Conversational, tooled, standalone: it answers about this
machine, searches Wikipedia, reads an article out of it, draws the answer as a
page of its own — and can hand all three to a second agent in one call.

    @commons/demo/hello-world

## Shape

    mode.viva.js    the assembly — manifest · tools · app · re-exports, nothing else
    aperture.js     /hello/{doctor,search,bot,agent}
    harness.js      HELLO + machine at the root, FORMAT on /dialogue
    tools/          the belt — index.js the barrel · doctor.js the paladin fold with two doors (/hello/doctor, viva_doctor) ·
                    web.js the doors, wikipedia.js the client, choose.js the picker ·
                    research.js the door onto a nested agent, brief.js the researcher's world
    page/           style.js the house rules · draw.js the guard · index.js the mint + the steering
    app/App.svelte  the buffer view

Armed names are `viva_doctor` · `web_search` · `web_read` · `research` ·
`generator_view_render` · `generator_view_revise` · `generator_view_inspect` · `generator_view_list`, on top of the
`fs_*` and `shell_run` every HARNESSED mode with a module mount already gets.
`web_read` is dark until a reader service is consumed — it says so rather than
pretending.

## The mint and the steering

`page/index.js` exports `emitter` and `generator`, and they are not the same
thing wearing two names.

`emitter` is the mint: the one place this mode's own code mints a buffer. It is
NOT in `tools`, so no model can reach it — the EMITTER trait mounts it at the
aperture's `/emit` and on `mode.emit`. It passes NO thread to
`generator.buffer`: the EMITTER drain binds every buffer it drains, and
`generator.buffer` binds whenever handed one, so doing both advances
`thread.counter` twice for one page. `tests/emitter.test.js` holds that.

`generator` arms nothing. The GENERATIVE trait owns the model's tools —
`generator_view_render` · `generator_view_revise` · `generator_view_inspect` · `generator_view_list` on
`mode.generator.tools` — and slurps this vector onto them AFTER, so its
middleware runs on every draw and revise (a URL import is refused before the
bundler sees it) and its two `open`s without an effect reword `render` and
`revise` with the house rules while the trait's effects stay. Every GENERATIVE
mode has the same four names; this mode only changes what two of them say.

## The nested agent

`research` runs a second hallucination that cannot see the conversation. It arms
`web` + `mode.generator.tools` by hand — never `mode.tools`, which would put
`research` inside itself — and folds the stream with `soma.transcript` rather
than calling `render()`. That choice is the whole point: `render()` throws on
any close but `complete` and throws the fold away with it, including a page the
inner agent already drew, flushed and put on screen. Folding ourselves means a
research that runs out of rounds still hands the page back, marked ERROR with
the cause named, and the outer agent answers from what is on screen.

Only `message` and `buffer` leave. The inner fold accumulates every other key of
every tool result — `markdown[]`, `links[]`, `url[]`, the lot — and none of it
crosses. `tests/rig.js` runs the real `respond()` loop against a scripted
faculty to prove it, offline, in milliseconds.

## Test

    deno test -A --no-check commons/instances/hello-world/tests/*.test.js

Deno walks up to the repo-root `deno.jsonc` for the import map, so the path is
the only argument. Snapshots are session-local — `.gitignore` covers
`**/tests/snapshots/`, so a fresh checkout writes its own on the first hot run:

    SNAPSHOT_HOT=1 deno test -A --no-check commons/instances/hello-world/tests/*.snapshot.test.js
