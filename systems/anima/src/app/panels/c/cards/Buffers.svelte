<script module>
  import { ThreadTraits } from "@vivalence/anima";

  async function createBuffer(terminal, thread) {
    if (thread.traits.includes("AIMED")) {
      const buffers = await ThreadTraits.aimed.pull(thread);
      terminal.$buffer.set(buffers[0]);
      return;
    }
    const { literal, literals, symbol, symbols, ...data } = thread.trait?.MASKED ?? {};
    terminal.$buffer.set(
      await thread.daemon.entities.buffer.create({
        mode: thread.mode?.id ?? thread.mode,
        thread: thread.id,
        data,
        literals: [...(literals ?? []), ...(literal ? [literal] : [])],
        symbols: [...(symbols ?? []), ...(symbol ? [symbol] : [])],
      }),
    );
  }
</script>

<script>
  import { getContext } from "svelte";
  import { chain } from "@vivalence/anima";
  import { TERMINALS } from "$client";
  import { logger } from "$telemetry";
  import Card from "./Card.svelte";
  import Row from "./Row.svelte";
  import { bufferName, clear } from "./buffers.js";

  const TONES = { DONE: "positive", ACTIVE: "primary", PENDING: "light", ERROR: "negative", STALE: "caution" };
  const VERBS = {
    inert: [],
    manual: ["prev", "next"],
    continuous: ["more", "stop"],
    escort: ["prev", "next", "home"],
  };
  const FACE = { prev: "‹ prev", next: "next ›", home: "home", more: "+ more", stop: "stop" };
  const TITLE = { prev: "the buffer before", next: "the buffer after", home: "the first buffer", more: "pull one more through the mount", stop: "stop → manual" };

  let { ...chrome } = $props();

  const terminals = getContext(TERMINALS);

  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const phase = chain(terminals, "$active", "$thread", "$phase");
  const threadTraits = chain(terminals, "$active", "$thread", "$traits");
  const buffers = chain(terminals, "$active", "$thread", "$buffers");
  const cursor = chain(terminals, "$active", "$buffer");

  const ordered = $derived([...($buffers ?? [])].sort((first, second) => (first.index ?? 0) - (second.index ?? 0)));
  const seated = $derived(ordered.findIndex((buffer) => buffer.id === $cursor?.id));
  const position = $derived(`${seated < 0 ? "–" : seated + 1} / ${ordered.length}`);
  const aimed = $derived($threadTraits?.includes("AIMED") ?? false);
  const queueing = $derived($threadTraits?.includes("QUEUEING") ?? false);
  const openable = $derived(aimed || ($mode?.implements?.("APPLICATION") ?? false));
  const hint = $derived(ordered.length ? "cursor empty · pick a buffer" : "no buffers · open or pull");

  const place = (buffer) => terminals.active?.$buffer.set(buffer);
  const pick = (buffer) => place($cursor?.id === buffer.id ? null : buffer);
  function step(delta) {
    if (!ordered.length) return;
    place(ordered[(Math.max(seated, 0) + delta + ordered.length) % ordered.length]);
  }

  function engage(key) {
    const current = $thread;
    if (!current) return;
    if (current.engage(key)) current.daemon.entities.thread.updateOne({ id: current.id }, { phase: key });
  }

  function run(key) {
    if (key === "prev") step(-1);
    else if (key === "next") step(1);
    else if (key === "home") place(ordered[0] ?? null);
    else if (key === "more") ThreadTraits.aimed.pull($thread);
    else if (key === "stop") engage("manual");
  }

  const release = () => $cursor?.release();

  let opening = $state(false);
  async function open() {
    const current = $thread;
    if (!current || opening) return;
    opening = true;
    try {
      await createBuffer(terminals.active, current);
    } catch (error) {
      logger.entry(`buffers/${current.id}`).fault(error);
    } finally {
      opening = false;
    }
  }

  let clearing = $state(false);
  async function wipe() {
    const current = $thread;
    if (!current || clearing) return;
    clearing = true;
    try {
      await clear(terminals.active, current);
    } catch (error) {
      logger.entry(`buffers/${current.id}/clear`).fault(error);
    } finally {
      clearing = false;
    }
  }
</script>

<Card label="buffers" meta={$thread ? position : null} {...chrome}>
  {#if !$thread}
    <div class="card-stack"><span class="card-dim">no thread</span></div>
  {:else}
    <div class="card-stack">
      <div class="card-group">
        <span class="card-name">cursor</span>
        {#if !$cursor}<span class="card-dim">{hint}</span>{/if}
        <div class="card-keys">
          <button
            class="card-key"
            disabled={!openable || opening}
            title={openable ? "pull one buffer through the mount when aimed, else create one" : "aim required · the mode opens no buffer by itself · toggle aimed in the thread's traits"}
            onclick={open}>{opening ? "…" : "open"}</button>
          {#if $phase === "continuous"}
            <button class="card-key" title="engage manual" onclick={() => engage("manual")}>stop queue</button>
          {:else}
            <button class="card-key" disabled={!queueing} title="engage continuous · needs aimed + queueing" onclick={() => engage("continuous")}>start queue</button>
          {/if}
          {#each VERBS[$phase] ?? [] as key (key)}
            <button class="card-key" disabled={!ordered.length && key !== "more"} title={TITLE[key]} onclick={() => run(key)}>{FACE[key]}</button>
          {/each}
          <button class="card-key" disabled={!$cursor} title="release the buffer under the cursor" onclick={release}>release</button>
        </div>
      </div>
      <div class="card-list">
        {#each ordered as buffer, index (buffer.id)}
          <Row selected={$cursor?.id === buffer.id} title="set the cursor" onclick={() => pick(buffer)}>
            <span class="card-dim buffers-index">{index + 1}</span>
            <span class="buffers-name">{bufferName(buffer)}</span>
            <span class="buffers-status {TONES[buffer.status] ?? 'light'}">{buffer.status?.toLowerCase() ?? ""}</span>
          </Row>
        {/each}
      </div>
      <div class="card-keys">
        <button class="card-key buffers-clear" disabled={!ordered.length || clearing} title="clear every buffer on this thread" onclick={wipe}>{clearing ? "…" : "clear"}</button>
      </div>
    </div>
  {/if}
</Card>

<style>
  .buffers-index {
    flex: none;
    width: 14px;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
  .buffers-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: inherit;
  }
  .buffers-status {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-light);
  }
  .buffers-status.positive {
    color: var(--signal-positive);
  }
  .buffers-status.primary {
    color: var(--signal-primary);
  }
  .buffers-status.negative {
    color: var(--signal-negative);
  }
  .buffers-status.caution {
    color: var(--signal-caution);
  }
  .buffers-clear:hover:not(:disabled) {
    color: var(--signal-negative-ink);
  }
</style>
