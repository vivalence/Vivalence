<script>
  import { v, Span, Pipe } from "@vivalence/typology";
  import { Helpdesk } from "@vivalence/drapes";
  import { atom } from "nanostores";
  import Trace from "./Trace.svelte";

  const { terminal, buffer } = $props();

  const SYSTEM =
    "You are the Oracle, a presence living inside vivalence's chaosmonkey testbed. Answer in one or two cryptic, faintly amused lines. Plain prose, no markdown, no lists.";

  const user = atom("");
  const assistant = atom("you've sought out the oracle; brave of you.");

  const clientPipe = new Pipe();
  const clientLogs = new Span().to(clientPipe);
  const clientLog = clientPipe.reactive([], (list, record) => [...list, record]);

  const serverPipe = new Pipe();
  const serverLogs = new Span().to(serverPipe);
  const serverLog = serverPipe.reactive([], (list, record) => [...list, record]);

  clientLogs.log({ props: { terminal: terminal?.id, buffer: buffer?.id, mode: buffer?.mode?.slug } });

  let busy = $state(false);

  async function askCortexObject() {
    const prompt = user.get()?.trim();
    if (!prompt || busy) return;
    busy = true;
    const call = clientLogs.branch("/cortex/object");
    call.log({ prompt });
    try {
      const hallucination = buffer.mode.daemon.cortex
        .hallucination({ tune: "eager" })
        .context.system(SYSTEM)
        .entities.turn.append({ role: "user", parts: [{ type: "text", text: prompt }] })
        .output.object(v.object({ answer: v.string().desc("the oracle's reply") }));
      call.log({ request: hallucination.configuration });
      const render = await hallucination.object.render();
      call.log({ render });
      assistant.set(render.object?.answer ?? "");
    } catch (error) {
      call.log(error);
      assistant.set(`… the oracle falters: ${error.message}`);
    } finally {
      busy = false;
    }
  }

  async function askHarnessObject() {
    const prompt = user.get()?.trim();
    if (!prompt || busy) return;
    busy = true;
    const call = clientLogs.branch("/harness/object");
    call.log({ prompt });
    try {
      const render = await buffer.mode.harness.object.render({
        turns: [{ role: "user", parts: [{ type: "text", text: prompt }] }],
        output: v.object({ answer: v.string() }),
      });
      call.log({ render });
      assistant.set(render?.object?.answer ?? "");
    } catch (error) {
      call.log(error);
      assistant.set(`… ${error.message}`);
    } finally {
      busy = false;
    }
  }

  async function askCortexStream() {
    const prompt = user.get()?.trim();
    if (!prompt || busy) return;
    busy = true;
    const call = clientLogs.branch("/cortex/dialogue");
    call.log({ prompt });
    assistant.set("");
    try {
      const stream = await buffer.mode.daemon.cortex
        .hallucination({ tune: "eager" })
        .context.system(SYSTEM)
        .entities.turn.append({ role: "user", parts: [{ type: "text", text: prompt }] })
        .dialogue.stream();
      call.log({ open: { tune: "eager" } });
      let text = "";
      let tokens = 0;
      for await (const packet of stream) {
        if (packet.event === "/part/delta" && packet.delta?.text) {
          text += packet.delta.text;
          assistant.set(text);
          tokens += 1;
        } else {
          serverLogs.log(packet.event, packet);
        }
      }
      call.log({ close: { tokens } });
    } catch (error) {
      call.log(error);
      assistant.set(`… ${error.message}`);
    } finally {
      busy = false;
    }
  }
</script>

<div class="oracle">
  <header class="bar">
    <span class="title">oracle</span>
    <span class="sub">chaosmonkey · client AI × span logs</span>
  </header>

  <div class="controls">
    <div class="group">
      <span class="group-label">client</span>
      <button class="btn" onclick={askCortexObject} disabled={busy}>cortex · object</button>
      <button class="btn" onclick={askHarnessObject} disabled={busy}>harness · object</button>
      <button class="btn" onclick={askCortexStream} disabled={busy}>cortex · stream</button>
    </div>
    <div class="group muted">
      <span class="group-label">runtime</span>
      <button class="btn" disabled>aperture · render</button>
      <button class="btn" disabled>emitter · render</button>
    </div>
  </div>

  <Helpdesk {user} {assistant} disabled={busy} onsubmit={askCortexObject} />

  <div class="logs">
    <section class="col">
      <div class="col-head"><span>client log</span><span class="count">{$clientLog.length}</span></div>
      <div class="col-body">
        {#each $clientLog as record, index (index)}
          <Trace {record} />
        {:else}
          <div class="empty">— nothing yet —</div>
        {/each}
      </div>
    </section>
    <section class="col">
      <div class="col-head"><span>server log</span><span class="count">{$serverLog.length}</span></div>
      <div class="col-body">
        {#each $serverLog as record, index (index)}
          <Trace {record} />
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
