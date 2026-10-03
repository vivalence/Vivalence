<script>
  import { getContext, untrack } from "svelte";
  import { chain, loudest, roster } from "@vivalence/anima";
  import { Float, Key } from "@vivalence/drapes";
  import { TERMINALS } from "$client";
  import { logger } from "$telemetry";
  import Glyph from "../../widgets/Glyph.svelte";

  let { axis = "row", side = "below", open = false, title = "terminals", ontoggle } = $props();

  const terminals = getContext(TERMINALS);
  const roster_ = terminals.$entities;
  const active = terminals.$active;

  let version = $state(0);
  let live = $state.raw({});

  $effect(() => {
    const tick = () => untrack(() => (version += 1));
    const teardowns = $roster_.flatMap((terminal) => [chain(terminal, "$thread", "$label").subscribe(tick), terminal.$settling.subscribe(tick)]);
    return () => teardowns.forEach((teardown) => teardown());
  });

  $effect(() => {
    const held = $roster_.map((terminal) => [terminal.id, terminal.$thread.get()]).filter(([, thread]) => thread);
    const offs = held.map(([id, thread]) => roster(thread).subscribe((rows) => untrack(() => (live = { ...live, [id]: loudest(rows) === "RUNNING" }))));
    return () => offs.forEach((off) => off());
  });

  const named = (label) => (typeof label === "object" ? label?.name : label) ?? null;

  const rows = $derived.by(() => {
    void version;
    return $roster_.map((terminal) => {
      const thread = terminal.$thread.get();
      return {
        terminal,
        label: thread ? (named(thread.label) ?? thread.mode?.slug ?? "thread") : terminal.settling ? "restoring…" : "empty terminal",
        sub: [terminal.id.slice(0, 6), thread ? [thread.daemon?.slug, thread.mode?.slug].filter(Boolean).join(" › ") : "no thread"].join(" · "),
        vacant: !thread,
      };
    });
  });

  let anchor = $state(null);

  const spawn = () => terminals.create().catch((error) => logger.entry("terminals/create").fault(error));
  const close = (event, terminal) => {
    event.stopPropagation();
    terminals.remove(terminal.id);
  };
</script>

<span class="anchor" bind:this={anchor}>
  <Key size="bone" stack={axis === "column"} latched={open} title="terminals" onclick={ontoggle}>
    <Glyph set="anima" name="view-columns" size={18} />
    <span class="count">{$roster_.length}</span>
  </Key>
</span>

{#if open}
  <Float {anchor} zone="0" {title} {side} onclose={ontoggle}>
    <div class="rows">
      {#each rows as row (row.terminal.id)}
        <div
          class="row-terminal"
          class:on={$active?.id === row.terminal.id}
          class:live={live[row.terminal.id]}
          class:vacant={row.vacant}
          role="button"
          tabindex="0"
          title="focus this terminal"
          onclick={() => terminals.activate(row.terminal.id)}
          onkeydown={(event) => event.key === "Enter" && terminals.activate(row.terminal.id)}>
          <span class="row-text">
            <span class="row-label">{row.label}</span>
            <span class="row-sub">{row.sub}</span>
          </span>
          <Key tone="ghost" size="mini" square label="✕" title="close terminal" onclick={(event) => close(event, row.terminal)} />
        </div>
      {:else}
        <span class="none">no terminals</span>
      {/each}
    </div>
    <Key size="row" label="+ terminal" title="open a terminal" onclick={spawn} />
  </Float>
{/if}

<style>
  .anchor {
    display: inline-flex;
    padding-bottom: var(--size-depth);
    pointer-events: auto;
  }
  .count {
    font-family: var(--font-family-code);
    font-size: 11px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .rows {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .row-terminal {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: var(--size-row);
    padding: 4px 6px 4px 8px;
    border-radius: var(--shape-radius-key);
    cursor: pointer;
    font-family: var(--font-family-code);
    color: var(--text-light);
  }
  .row-terminal.on {
    background: var(--signal-primary-tint);
    color: var(--text-strong);
  }
  .row-terminal.on .row-label {
    font-weight: 600;
  }
  .row-terminal.vacant .row-label {
    color: var(--boundary-strong);
  }
  .row-terminal.live .row-label {
    color: var(--signal-primary-ink);
    animation: row-pulse 1.2s ease-in-out infinite;
  }
  @keyframes row-pulse {
    50% {
      opacity: 0.45;
    }
  }
  .row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .row-label {
    font-size: 11.5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row-sub {
    font-size: 10px;
    color: var(--text-light);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .none {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
</style>
