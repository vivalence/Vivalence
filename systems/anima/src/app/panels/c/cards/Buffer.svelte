<script>
  import { getContext } from "svelte";
  import { chain } from "@vivalence/anima";
  import { TERMINALS } from "$client";
  import { logger } from "$telemetry";
  import Card from "./Card.svelte";
  import { clear } from "./buffers.js";

  const HOOKS = ["mount", "unmount", "release"];

  let { ...chrome } = $props();

  const terminals = getContext(TERMINALS);

  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const buffers = chain(terminals, "$active", "$thread", "$buffers");
  const buffer = chain(terminals, "$active", "$buffer");

  const ordered = $derived([...($buffers ?? [])].sort((first, second) => (first.index ?? 0) - (second.index ?? 0)));
  const seated = $derived(ordered.findIndex((held) => held.id === $buffer?.id));
  const position = $derived(`${seated < 0 ? "–" : seated + 1} / ${ordered.length}`);
  const owner = $derived($buffer?.mode && typeof $buffer.mode === "object" ? $buffer.mode : $mode);
  const held = (name) => $buffer?.hooks?.[name]?.length ?? 0;
  const hint = $derived(ordered.length ? "cursor empty · pick a buffer in buffers" : "no buffers · open or pull in the thread card");

  let busy = $state(false);
  async function wipe() {
    const current = $thread;
    if (!current || busy) return;
    busy = true;
    try {
      await clear(terminals.active, current);
    } catch (error) {
      logger.entry(`buffers/${current.id}/clear`).fault(error);
    } finally {
      busy = false;
    }
  }
</script>

<Card label="buffer" meta={$thread ? position : null} {...chrome}>
  {#if !$thread}
    <div class="card-stack"><span class="card-dim">no thread</span></div>
  {:else}
    <div class="card-stack">
      {#if !$buffer}<span class="card-dim">{hint}</span>{/if}
      <div class="card-group">
        <span class="card-name">mode</span>
        <div class="buffer-grid">
          <span class="card-dim">name</span>
          <span class="buffer-value">{owner?.name ?? owner?.slug ?? "—"} · {owner?.type ?? "—"}</span>
        </div>
      </div>
      <div class="card-group">
        <span class="card-name">hooks</span>
        <div class="card-keys">
          {#each HOOKS as name (name)}
            <span class="card-pill buffer-hook" class:lit={held(name) > 0} title="{held(name)} held"><span class="buffer-hook-dot"></span>{name}</span>
          {/each}
        </div>
      </div>
      <div class="card-keys">
        <button class="card-key buffer-clear" disabled={!ordered.length || busy} title="clear every buffer on this thread" onclick={wipe}>{busy ? "…" : "clear"}</button>
      </div>
    </div>
  {/if}
</Card>

<style>
  .buffer-grid {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 4px 10px;
    align-items: baseline;
  }
  .buffer-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-strong);
  }
  .buffer-hook {
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
    color: var(--text-light);
  }
  .buffer-hook-dot {
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: var(--text-muted);
  }
  .buffer-hook.lit {
    box-shadow: inset 0 0 0 var(--size-ring) var(--signal-positive);
    color: var(--text-strong);
  }
  .buffer-hook.lit .buffer-hook-dot {
    background: var(--signal-positive);
  }
  .buffer-clear:hover:not(:disabled) {
    color: var(--signal-negative-ink);
  }
</style>
