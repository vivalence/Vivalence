<script>
  import { getContext } from "svelte";
  import { LIGHTHOUSE, TERMINALS } from "$client";
  import { chain } from "@vivalence/kajuit";
  import { belt } from "@vivalence/typology";
  import { Section } from "@vivalence/drapes";
  import ThreadLabel from "./ThreadLabel.svelte";

  const lighthouse = getContext(LIGHTHOUSE);
  const terminals = getContext(TERMINALS);

  const activeThread = chain(terminals, "$active", "$thread");

  let daemons = lighthouse.$daemons;

  // Unavailable/error daemons are ignored entirely here — they 404 on /batch and would
  // otherwise render empty with a warning dot. Health is surfaced in the crown instead.
  const availableDaemons = $derived($daemons.filter((daemon) => daemon.status.is("healthy")));

  let collapsed = $state({});
  const toggle = (slug) => (collapsed[slug] = !collapsed[slug]);

  const code = (entity) => entity.status?.reflection?.code?.toLowerCase() ?? "";

  let threads = $state([]);
  let intents = $state([]);

  const todayThreads = $derived(
    threads.filter(({ thread }) => belt.time.bucket(thread.updatedAt) === "today"),
  );
  const earlierThreads = $derived(
    threads.filter(({ thread }) => belt.time.bucket(thread.updatedAt) === "earlier"),
  );

  // Live count off the thread's $buffers computed (filters the daemon buffer repo by thread),
  // not the populate snapshot — so a buffer created in F shows here immediately.
  const bufferCount = (thread) => thread.$buffers?.get()?.length ?? 0;

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
        const offBuffer = daemon.entities.buffer?.$entities.subscribe(recompute);
        if (offBuffer) teardowns.push(offBuffer);
        await daemon.entities.thread
          .find({}, { populate: ["mode", "intent"] })
          .catch((error) => console.warn(`[probe] d thread find ${daemon.slug} failed`, error));
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
    try {
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
    } catch (error) {
      console.warn(`[probe] selectMode ${daemon.slug}/${mode.slug} failed`, error);
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
    try {
      await spawnBuffer(loadThread(thread));
    } catch (error) {
      console.warn(`[probe] quickStart failed`, error);
    }
  }

  function onThreadAux(thread, event) {
    if (event.button !== 1) return;
    event.preventDefault();
    loadThread(thread, true);
  }
</script>

{#snippet threadRow(thread, daemon)}
  {@const active = $activeThread?.id === thread.id}
  <button
    class="row thread"
    class:on={active}
    onclick={() => loadThread(thread)}
    ondblclick={() => quickStart(thread)}
    onauxclick={(event) => onThreadAux(thread, event)}
    title="click load · dbl-click quick-start · middle-click new terminal">
    <span class="tick" class:on={active}></span>
    <span class="name" class:on={active}><ThreadLabel {thread} /></span>
    <span class="tmode">{thread.mode?.slug ?? "-"}</span>
    <span class="time">{belt.time.since(thread.updatedAt)}</span>
    <span class="bufs" class:has={bufferCount(thread) > 0}>{bufferCount(thread)}</span>
  </button>
{/snippet}

<div class="panel">
  <section class="daemons">
    <Section label="daemons" count={availableDaemons.length} />
    {#each availableDaemons as daemon (daemon.slug)}
      {@const modes = (daemon.entities?.mode?.$entities.get() ?? []).filter(
        (m) => m.implements("application") || m.implements("conversational"),
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
            <span class="subpip {code(mode)}"></span>
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
    <Section label="threads" count={threads.length} />
    {#if !threads.length}
      <div class="empty">no threads</div>
    {:else}
      {#if todayThreads.length}
        <div class="subgroup">today</div>
        {#each todayThreads as item (item.thread.id)}{@render threadRow(item.thread, item.daemon)}{/each}
      {/if}
      {#if earlierThreads.length}
        <div class="subgroup">earlier</div>
        {#each earlierThreads as item (item.thread.id)}{@render threadRow(item.thread, item.daemon)}{/each}
      {/if}
    {/if}
  </section>

  <section class="intents">
    <Section label="intents" count={intents.length || null} />
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
    min-width: 250px;
    width: 100%;
    height: 100%;
    min-width: 160px;
    overflow: auto;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    letter-spacing: 0.02em;
    padding: 14px 14px 18px;
    box-sizing: border-box;

  }
  section {
    margin-bottom: 18px;
  }
  section:last-child {
    margin-bottom: 0;
  }
  section :global(.section-head) {
    margin-bottom: 8px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 7px;
    width: 100%;
    padding: 3px 2px;
    background: none;
    border: none;
    border-radius: 2px;
    color: inherit;
    font: inherit;
    text-align: left;
    line-height: 1.1;
  }
  button.row {
    cursor: pointer;
  }
  button.row:hover {
    background: color-mix(in srgb, var(--colors-skeleton-3-contrast) 5%, transparent);
  }
  .daemon .name {
    font-weight: 500;
  }
  .caret {
    width: 8px;
    font-size: var(--font-size-2xs);
    opacity: 0.45;
    flex-shrink: 0;
  }
  .mode {
    gap: 8px;
    padding-left: 22px;
    opacity: 0.75;
  }
  .name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pip {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--colors-skeleton-3-boundary) 70%, transparent);
  }
  .subpip {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--colors-skeleton-3-contrast) 40%, transparent);
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
  .count {
    opacity: 0.4;
    font-size: var(--font-size-xs);
  }
  .type {
    opacity: 0.4;
    font-size: var(--font-size-xs);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .subgroup {
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.28;
    padding: 4px 2px 3px;
  }
  .thread {
    gap: 8px;
    padding: 4px 6px 4px 4px;
  }
  .thread.on {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 10%, transparent);
  }
  .tick {
    width: 2px;
    height: 14px;
    border-radius: 1px;
    flex-shrink: 0;
    background: transparent;
  }
  .tick.on {
    background: var(--colors-skeleton-0-primary-base);
  }
  .thread .name.on {
    color: var(--colors-skeleton-0-primary-base);
  }
  .tmode {
    font-size: var(--font-size-2xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.3;
    flex-shrink: 0;
  }
  .time {
    font-size: var(--font-size-xs);
    opacity: 0.3;
    width: 26px;
    text-align: right;
    flex-shrink: 0;
  }
  .bufs {
    font-size: var(--font-size-xs);
    width: 14px;
    text-align: right;
    flex-shrink: 0;
    opacity: 0.25;
  }
  .bufs.has {
    color: var(--colors-skeleton-0-primary-base);
    opacity: 0.7;
  }
  .empty {
    padding: 4px 2px;
    opacity: 0.3;
    text-transform: lowercase;
  }
  .empty.mode {
    padding-left: 22px;
  }
  .intent .name {
    flex: 1;
  }
</style>
