<script>
  import { getContext } from "svelte";
  import { LIGHTHOUSE, TERMINALS } from "$client";
  import ThreadLabel from "./ThreadLabel.svelte";

  const lighthouse = getContext(LIGHTHOUSE);
  const terminals = getContext(TERMINALS);

  let daemons = lighthouse.$daemons;

  let collapsed = $state({});
  const toggle = (slug) => (collapsed[slug] = !collapsed[slug]);

  const code = (entity) => entity.status?.reflection?.code?.toLowerCase() ?? "";

  let threads = $state([]);
  let intents = $state([]);

  $effect(() => {
    const list = $daemons;
    const teardowns = [];
    let cancelled = false;

    const recompute = () => {
      if (cancelled) return;
      const gatheredThreads = [];
      const gatheredIntents = [];
      for (const daemon of list) {
        if (!daemon.status.is("healthy")) continue;
        for (const thread of daemon.entities.thread.$entities.get())
          gatheredThreads.push({ thread, daemon });
        for (const intent of daemon.entities.intent?.$entities.get() ?? [])
          gatheredIntents.push({ intent, daemon });
      }
      gatheredThreads.sort((a, b) =>
        String(b.thread.updatedAt ?? "").localeCompare(String(a.thread.updatedAt ?? "")),
      );
      threads = gatheredThreads;
      intents = gatheredIntents;
    };

    (async () => {
      for (const daemon of list) {
        if (!daemon.status.is("healthy")) continue;
        teardowns.push(daemon.entities.thread.$entities.subscribe(recompute));
        const offIntent = daemon.entities.intent?.$entities.subscribe(recompute);
        if (offIntent) teardowns.push(offIntent);
        await daemon.entities.thread.find({}, { populate: ["mode", "intent"] });
      }
    })();

    return () => {
      cancelled = true;
      for (const teardown of teardowns) teardown();
    };
  });

  function labelName(label) {
    return typeof label === "object" ? label?.name : label;
  }

  async function selectMode(daemon, mode) {
    const terminal = terminals.active ?? terminals.create();
    const current = terminal.thread;
    if (current && current.daemon?.slug === daemon.slug) {
      const previous = current.mode;
      const label = labelName(current.label);
      const wasDefault = label === previous?.name || label === previous?.slug;

      await current.daemon.entities.thread.updateOne({ id: current.id }, { mode: mode.id });
      current.mode = mode;

      if (wasDefault) {
        const name = mode.name ?? mode.slug;
        current.label = { ...(typeof current.label === "object" ? current.label : {}), name };
        await current.daemon.entities.thread.updateOne(
          { id: current.id },
          { trait: { ...current.trait, LABELED: { ...(current.trait?.LABELED ?? {}), name } } },
        );
      }
    } else {
      const thread = await daemon.entities.thread.create({ mode: mode.id });
      daemon.entities.thread.resolve?.(thread);
      terminal.thread = thread;
    }
  }

  async function spawnBuffer(terminal) {
    const current = terminal?.thread;
    if (!current) return;
    const buffer = await current.daemon.entities.buffer.create({
      mode: current.mode?.id ?? current.mode,
      thread: current.id,
      data: {},
    });
    terminal.buffer = buffer;
  }

  function loadThread(thread, fresh = false) {
    const terminal = fresh ? terminals.create() : (terminals.active ?? terminals.create());
    terminal.thread = thread;
    return terminal;
  }

  async function quickStart(thread) {
    await spawnBuffer(loadThread(thread));
  }

  function onThreadAux(thread, event) {
    if (event.button !== 1) return;
    event.preventDefault();
    loadThread(thread, true);
  }
</script>

<div class="panel">
  <section class="daemons">
    <header>daemons</header>
    {#each $daemons as daemon (daemon.slug)}
      {@const modes = (daemon.entities?.mode?.$entities.get() ?? []).filter((m) =>
        m.implements("viewable"),
      )}
      {@const open = !collapsed[daemon.slug]}
      <button class="row daemon" onclick={() => toggle(daemon.slug)}>
        <span class="caret">{open ? "▾" : "▸"}</span>
        <span class="pip {code(daemon)}"></span>
        <span class="name">{daemon.slug}</span>
        <span class="count">{modes.length}</span>
      </button>
      {#if open}
        {#each modes as mode (mode.id)}
          <button class="row mode" onclick={() => selectMode(daemon, mode)}>
            <span class="pip {code(mode)}"></span>
            <span class="name">{mode.slug}</span>
            <span class="type">{mode.type}</span>
          </button>
        {:else}
          <div class="row empty mode">no modes</div>
        {/each}
      {/if}
    {:else}
      <div class="empty">no daemons</div>
    {/each}
  </section>

  <section class="threads">
    <header>threads</header>
    {#each threads as { thread, daemon } (thread.id)}
      <button
        class="row thread"
        onclick={() => loadThread(thread)}
        ondblclick={() => quickStart(thread)}
        onauxclick={(event) => onThreadAux(thread, event)}
        title="click load · dbl-click quick-start · middle-click new terminal">
        <span class="name"><ThreadLabel {thread} /></span>
        <span class="type">{thread.mode?.slug ?? daemon.slug}</span>
      </button>
    {:else}
      <div class="empty">no threads</div>
    {/each}
  </section>

  <section class="intents">
    <header>intents</header>
    {#each intents as { intent } (intent.id)}
      <div class="row intent">
        <span class="name">{intent.name ?? intent.slug}</span>
        <span class="type">{intent.mode?.slug ?? ""}</span>
      </div>
    {:else}
      <div class="empty">no intents</div>
    {/each}
  </section>
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    min-width: 160px;
    overflow: auto;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
  }
  section {
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 50%, transparent);
    padding: 6px 0 8px;
  }
  header {
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.5;
    padding: 0 10px 6px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 3px 10px;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    text-align: left;
    line-height: 1;
  }
  button.row {
    cursor: pointer;
  }
  button.row:hover {
    background: color-mix(in srgb, var(--colors-skeleton-3-boundary) 30%, transparent);
  }
  .daemon {
    text-transform: lowercase;
    opacity: 0.85;
  }
  .caret {
    width: 8px;
    opacity: 0.5;
    flex-shrink: 0;
  }
  .mode {
    padding-left: 30px;
    opacity: 0.6;
  }
  .thread .name,
  .intent .name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pip {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--colors-skeleton-3-boundary) 70%, transparent);
  }
  .pip.healthy {
    background: var(--colors-skeleton-0-primary-base);
  }
  .pip.unavailable {
    background: var(--colors-skeleton-0-warning-base);
  }
  .pip.error {
    background: var(--colors-skeleton-0-danger-base);
  }
  .name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .type {
    opacity: 0.45;
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
  }
  .count {
    opacity: 0.4;
    font-size: var(--font-size-2xs);
  }
  .empty {
    padding: 4px 14px;
    opacity: 0.3;
    text-transform: lowercase;
  }
  .empty.mode {
    padding-left: 30px;
  }
</style>
