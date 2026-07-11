<script>
  import { v, Span, trace } from "@vivalence/typology";
  import { Helpdesk } from "@vivalence/drapes";
  import { atom } from "nanostores";
  import Trace from "./Trace.svelte";

  const { terminal, buffer } = $props();

  const SYSTEM =
    "You are the Oracle, a presence living inside vivalence's chaosmonkey testbed. Answer in one or two cryptic, faintly amused lines. Plain prose, no markdown, no lists.";

  const user = atom("");
  const assistant = atom("you've sought out the oracle; brave of you.");

  const storageKey = `oracle:logs:${buffer.id}`;
  const client = new Span("oracle");
  client.records.push(...JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
  client.pipe.tap((r) => console.log(`[oracle:]${r.path} ${r.verb ?? ""}`, r.data));

  const logger = trace.live(client);
  let clientStory = $state.raw(logger.get());
  logger.subscribe((story) => (clientStory = story));

  let serverStory = $state.raw(trace.chronicle.seed());
  const serverStep = (record) => (serverStory = trace.chronicle.step(serverStory, record));

  const stream = new Span("stream");
  stream.pipe.tap(serverStep);

  client.pipe.tap(() => localStorage.setItem(storageKey, JSON.stringify(client.records.slice(-500))));

  client.branch("props").note({ terminal: terminal.id, buffer: buffer.id });
  let busy = $state(false);

  // 
  async function askCortexObject() {
    const prompt = user.get()?.trim();
    if (!prompt || busy) return;
    busy = true;
    user.set("");
    const call = client.branch("/cortex/object");
    call.note({ prompt });
    try {
      const hallucination = buffer.mode.daemon.cortex
        .hallucination({ tune: "eager" })
        .context.system(SYSTEM)
        .entities.turn.append({ role: "user", parts: [{ type: "text", text: prompt }] })
        .output.object(v.object({ answer: v.string().desc("the oracle's reply") }));
      call.note({ request: hallucination.configuration });
      const render = await hallucination.object.render();
      call.note({ render });
      assistant.set(render.object?.answer ?? "");
    } catch (error) {
      call.fault(error);
      assistant.set(`… the oracle falters: ${error.message}`);
    } finally {
      busy = false;
    }
  }

  async function askHarnessObject() {
    const prompt = user.get()?.trim();
    if (!prompt || busy) return;
    busy = true;
    user.set("");
    const call = client.branch("/harness/object");
    call.note({ prompt });
    try {
      const render = await buffer.mode.harness.object.render({
        turns: [{ role: "user", parts: [{ type: "text", text: prompt }] }],
        output: v.object({ answer: v.string() }),
      });
      call.note({ render });
      assistant.set(render?.object?.answer ?? "");
    } catch (error) {
      call.fault(error);
      assistant.set(`… ${error.message}`);
    } finally {
      busy = false;
    }
  }

  // async function askHarnessDialogueStream() {
  //   const prompt = user.get()?.trim();
  //   if (!prompt) return;
  //   // const conversation = terminal.thread?.conversation;
  //   const call = client.branch("/harness/dialogue").note({ prompt });

  //   if (!conversation?.send?.dialogue?.open) {
  //     call.fault(new Error("dock not live — start chatting first"));
  //     assistant.set("… the dock isn't live yet; start chatting first.");
  //     return;
  //   }

  //   user.set("");
  //   // terminal.thread.$pending?.set?.(true); //@beef wtf is this??!!
  //   conversation.send.dialogue //
  //     .open({ thread: terminal.thread.id, parts: [{ type: "text", text: prompt }] });

  //   //@beef the whole stream part is missing! i want to have the answer returned streamed into the textarea!

  //   call.note({ sent: true });
  // }

  async function askCortexStream() {
    const prompt = user.get()?.trim();
    if (!prompt || busy) return;
    const turn = { role: "user", parts: [{ type: "text", text: prompt }] };

    busy = true;
    user.set("");
    assistant.set("");
    client.branch("/buffer/cortex/dialogue/turn").note(turn);

    try {
      const source = await buffer.mode.daemon.cortex
        .hallucination({ tune: "eager" })
        .context.system(SYSTEM)
        .entities.turn.append(turn)
        .dialogue.stream();
      let text = "";
      let tokens = 0;
      for await (const packet of source) {
        if (packet.event === "/part/delta" && packet.delta?.text) {
          text += packet.delta.text;
          assistant.set(text);
          tokens += 1;
        } else {
          stream.branch(packet.event).note(packet);
        }
        client.branch("/buffer/cortex/dialogue/streamed").note({ tokens, text });
      }
    } catch (error) {
      client.branch("/buffer/cortex/dialogue/catch").fault(error);
      assistant.set(`… ${error.message}`);
    } finally {
      busy = false;
    }
  }

  // 
  async function askApertureRender() {
    const prompt = user.get()?.trim();
    if (!prompt || busy) return;
    busy = true;
    user.set("");
    const call = client.branch("/aperture/render");
    call.note({ prompt });
    try {
      const result = await buffer.mode.call.ask({ prompt });
      call.note({ answer: result.answer });
      assistant.set(result.answer ?? "");
      if (result.trace) for (const record of result.trace) serverStep(record);
    } catch (error) {
      call.fault(error);
      assistant.set(`… ${error.message}`);
    } finally {
      busy = false;
    }
  }

  async function askEmitterVision() {
    const prompt = user.get()?.trim();
    if (!prompt || busy) return;
    user.set("");
    busy = true;
    const call = client.branch("/emitter/vision");
    call.note({ prompt });
    try {
      console.log({ prompt, thread: terminal.thread.id });
      const result = await buffer.mode.emit.vision({ prompt, thread: terminal.thread.id });
      console.log({ result });
      call.note({ emitted: result });
      const visions = (terminal.thread.$buffers.get() ?? []).filter(
        (b) => b.mode?.slug === "vision",
      );
      const fresh = visions.at(-1);
      if (fresh) terminal.buffer = fresh;
    } catch (error) {
      call.fault(error);
      assistant.set(`… ${error.message}`);
    } finally {
      busy = false;
    }
  }

  let mirroring = $state(false);
  $effect(() => {
    if (!mirroring) return;
    const streaming = terminal.thread?.$streaming;
    const turns = terminal.thread?.$turns;
    // const mirror = client.branch("/dialogue/mirror"); //
    const reflect = () => {
      const live = streaming?.get?.();
      if (live?.text) return; //void (assistant.set(live.text), mirror.note({ streaming: live.text.length }));
      const last = [...(turns?.get?.() ?? [])].reverse().find((turn) => turn.role === "assistant");
      const text = last?.parts?.find((part) => part.type === "text")?.text;
      if (text) assistant.set(text); //(, mirror.note({ turn: text.length }));
    };
    const unstream = streaming?.subscribe?.(reflect);
    const unturns = turns?.subscribe?.(reflect);
    return () => {
      unstream?.();
      unturns?.();
    };
  });
</script>

<div class="oracle">
  <header class="bar">
    <span class="title">oracle</span>
    <span class="sub">chaosmonkey · client AI × span traces</span>
  </header>

  <div class="controls">
    <div class="group">
      <span class="group-label">client</span>
      <button class="btn" onclick={askCortexObject} disabled={busy}>cortex · object</button>
      <button class="btn" onclick={askHarnessObject} disabled={busy}>harness · object</button>
      <button class="btn" onclick={askCortexStream} disabled={busy}>cortex · stream</button>
    </div>
    <div class="group">
      <span class="group-label">runtime</span>
      <button class="btn" onclick={askApertureRender} disabled={busy}>aperture · render</button>
      <button class="btn" onclick={askEmitterVision} disabled={busy}>emitter · render</button>
    </div>
    <!-- <div class="group"> -->
    <!--   <span class="group-label">dock</span> -->
    <!--   <button class="btn" onclick={askHarnessDialogueStream}>harness · dialogue</button> -->
    <!--   <button class="btn" class:on={mirroring} onclick={() => (mirroring = !mirroring)} -->
    <!--     >dialogue · mirror</button> -->
    <!-- </div> -->
  </div>

  <Helpdesk {user} {assistant} disabled={busy} onsubmit={askCortexObject} />

  <div class="logs">
    <section class="col">
      <div class="col-head">
        <span>client trace</span><span class="count">{clientStory.roots.length}</span>
      </div>
      <div class="col-body">
        {#each clientStory.roots as node (node.id)}
          <Trace {node} />
        {:else}
          <div class="empty">— nothing yet —</div>
        {/each}
      </div>
    </section>
    <section class="col">
      <div class="col-head">
        <span>server trace</span><span class="count">{serverStory.roots.length}</span>
      </div>
      <div class="col-body">
        {#each serverStory.roots as node (node.id)}
          <Trace {node} />
        {:else}
          <div class="empty">— streamed spans land here —</div>
        {/each}
      </div>
    </section>
  </div>
</div>

<style>
  .oracle {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
    padding: 18px;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
    overflow: hidden;
  }
  .bar {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }
  .title {
    font-size: var(--font-size-lg);
    letter-spacing: 0.06em;
  }
  .sub {
    font-size: var(--font-size-xs);
    opacity: 0.45;
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;
  }
  .group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .group.muted {
    opacity: 0.5;
  }
  .group-label {
    font-size: var(--font-size-2xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.45;
  }
  .btn {
    padding: 6px 14px;
    font: inherit;
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-0-primary-base);
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-primary-base) 40%, transparent);
    border-radius: 5px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.12s;
  }
  .btn:not(:disabled):hover {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 14%, transparent);
  }
  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    color: inherit;
    border-color: color-mix(in srgb, currentColor 20%, transparent);
  }
  .btn.on {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 22%, transparent);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .logs {
    display: flex;
    gap: 14px;
    flex: 1;
    min-height: 0;
  }
  .col {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 28%, transparent);
    border-radius: 8px;
    background: color-mix(in srgb, var(--colors-skeleton-3-contrast) 3%, transparent);
    overflow: hidden;
  }
  .col-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.55;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 22%, transparent);
  }
  .count {
    opacity: 0.7;
    letter-spacing: 0;
  }
  .col-body {
    flex: 1;
    overflow-y: auto;
    padding: 6px 0;
  }
  .empty {
    padding: 16px 12px;
    font-size: var(--font-size-xs);
    opacity: 0.35;
  }
</style>
