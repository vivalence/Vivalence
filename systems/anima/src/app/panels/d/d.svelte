<script>
  import { getContext, untrack } from "svelte";
  import { LIGHTHOUSE, TERMINALS } from "$client";
  import { ModeTraits, TONES, chain, loudest } from "@vivalence/anima";
  import { belt } from "@vivalence/typology";
  import { logger } from "$telemetry";
  import { Card, Empty, Input, Key, Pressed, Row, Section, Status } from "@vivalence/drapes";
  import ThreadLabel from "./ThreadLabel.svelte";

  const lighthouse = getContext(LIGHTHOUSE);
  const terminals = getContext(TERMINALS);

  const activeThread = chain(terminals, "$active", "$thread");

  let daemons = lighthouse.$daemons;

  const availableDaemons = $derived($daemons.filter((daemon) => daemon.status.is("healthy")));

  let sections = $state({ threads: true, modes: true, intents: true });
  const toggleSection = (name) => (sections[name] = !sections[name]);

  let groups = $state({});
  const groupOpen = (section, slug) =>
    groups[`${section}:${slug}`] ?? slug === $activeThread?.daemon?.slug;
  const toggleGroup = (section, slug) => (groups[`${section}:${slug}`] = !groupOpen(section, slug));

  const code = (entity) => entity.status?.reflection?.code?.toLowerCase() ?? "";

  let threads = $state([]);
  let intents = $state([]);

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
          .catch((error) => logger.entry(`threads/${daemon.slug}`).fault(error));
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
      if (mode.implements("STANDALONE")) await ModeTraits.standalone.open(terminal, mode);
    } catch (error) {
      logger.entry(`threads/${daemon.slug}/${mode.slug}`).fault(error);
    }
  }

  async function activateIntent(daemon, intent) {
    try {
      const terminal = terminals.active ?? terminals.create();
      const thread = await daemon.entities.thread.create({
        mode: intent.mode?.id ?? intent.mode,
        intent: intent.id,
      });
      daemon.entities.thread.resolve?.(thread);
      terminal.thread = thread;
    } catch (error) {
      logger.entry(`threads/${daemon.slug}/${intent.slug}`).fault(error);
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
      logger.entry("threads/quickstart").fault(error);
    }
  }

  async function deleteThread(thread) {
    try {
      groups[`threads:${thread.daemon.slug}`] = true;
      for (const terminal of terminals.entities)
        if (terminal.thread?.id === thread.id) terminal.thread = null;
      for (const buffer of thread.$buffers?.get() ?? [])
        thread.daemon.entities.buffer.drop(buffer.id);
      await thread.daemon.entities.buffer.remove({ thread: thread.id });
      await thread.daemon.entities.thread.removeOne({ id: thread.id });
    } catch (error) {
      logger.entry(`threads/${thread.id}`).fault(error);
    }
  }

  function onThreadAux(thread, event) {
    if (event.button !== 1) return;
    event.preventDefault();
    loadThread(thread, true);
  }

  const SORTS = ["recent", "a–z", "type"];
  const VIEWS = ["card", "list", "table"];
  const GLYPHS = { card: "▦", list: "☰", table: "▤" };
  const HEALTH = { healthy: "positive", mounting: "primary", unavailable: "caution", error: "negative" };

  let picked = $state(null);
  let kind = $state(null);
  let query = $state("");
  let searching = $state(false);
  let well = $state(null);
  let sort = $state(SORTS[0]);
  let step = $state(0);
  let views = $state({ threads: VIEWS[0], modes: VIEWS[0] });
  let activity = $state.raw({});

  $effect(() => {
    const healthy = availableDaemons;
    const census = () => {
      const held = {};
      for (const daemon of healthy)
        for (const row of daemon.entities.activity?.$entities.get() ?? []) {
          const id = row.thread?.id ?? row.thread;
          if (id) (held[id] ??= []).push(row);
        }
      activity = held;
    };
    const teardowns = healthy.map((daemon) => daemon.entities.activity?.$entities.subscribe(() => untrack(census))).filter(Boolean);
    return () => teardowns.forEach((teardown) => teardown());
  });

  const threadName = (thread) => labelName(thread.label) ?? thread.mode?.slug ?? thread.id?.slice(0, 8) ?? "";
  const offered = (daemon) =>
    (daemon.entities?.mode?.$entities.get() ?? []).filter((mode) => mode.implements("application") || mode.implements("conversational"));

  const THREAD_ORDER = {
    recent: () => 0,
    "a–z": (first, second) => threadName(first.thread).localeCompare(threadName(second.thread)),
    type: (first, second) =>
      (first.thread.mode?.type ?? "").localeCompare(second.thread.mode?.type ?? "") ||
      (first.thread.mode?.slug ?? "").localeCompare(second.thread.mode?.slug ?? ""),
  };
  const MODE_ORDER = {
    recent: () => 0,
    "a–z": (first, second) => (first.mode.slug ?? "").localeCompare(second.mode.slug ?? ""),
    type: (first, second) => (first.mode.type ?? "").localeCompare(second.mode.type ?? ""),
  };
  const META = {
    recent: ({ thread }) => belt.time.since(thread.updatedAt),
    "a–z": ({ daemon }) => daemon.slug,
    type: ({ thread }) => thread.mode?.type ?? "",
  };

  const needle = $derived(query.trim().toLowerCase());
  const within = (daemon) => !picked || picked === daemon.slug;
  const worn = (daemon, mode) => $activeThread?.mode?.id === mode.id && $activeThread?.daemon?.slug === daemon.slug;
  const typed = (mode) => !kind || mode?.type === kind;

  const kinds = $derived([...new Set(availableDaemons.filter(within).flatMap((daemon) => offered(daemon).map((mode) => mode.type)))].filter(Boolean));
  const matched = $derived(
    threads
      .filter(({ thread, daemon }) => within(daemon) && typed(thread.mode))
      .filter(({ thread }) => !needle || `${threadName(thread)} ${thread.mode?.slug ?? ""}`.toLowerCase().includes(needle))
      .sort(THREAD_ORDER[sort]),
  );
  const limit = $derived(3 + 6 * (2 ** step - 1));
  const listed = $derived(matched.slice(0, limit));
  const more = $derived(Math.min(6 * 2 ** step, matched.length - limit));
  const modes = $derived(
    availableDaemons
      .filter(within)
      .flatMap((daemon) => offered(daemon).map((mode) => ({ mode, daemon })))
      .filter(({ mode }) => typed(mode) && (!needle || `${mode.name ?? ""} ${mode.slug ?? ""}`.toLowerCase().includes(needle)))
      .sort(MODE_ORDER[sort]),
  );
  const mounting = $derived($daemons.filter((daemon) => within(daemon) && !daemon.status.is("healthy")).map((daemon) => `${daemon.slug} · ${code(daemon) || "unknown"}`));
  const offers = $derived(intents.filter(({ daemon, intent }) => within(daemon) && (!needle || `${intent.name ?? ""} ${intent.slug ?? ""}`.toLowerCase().includes(needle))));

  function pick(slug) {
    picked = slug;
    kind = null;
    step = 0;
  }

  function narrow(name) {
    kind = kind === name ? null : name;
    step = 0;
  }

  function cycle(event, section) {
    event.stopPropagation();
    views[section] = VIEWS[(VIEWS.indexOf(views[section]) + 1) % VIEWS.length];
  }

  function seek() {
    searching = true;
    well?.querySelector("input")?.focus();
  }

  function rest() {
    if (!query.trim()) searching = false;
  }

  function discard(event, thread) {
    event.stopPropagation();
    deleteThread(thread);
  }
</script>

{#snippet badge(thread)}
  {@const rows = activity[thread.id] ?? []}
  {#if rows.length}
    {@const loud = loudest(rows)}
    <Status
      tone={TONES[loud]}
      word={String(rows.length)}
      live={loud === "RUNNING"}
      pulse={loud === "RUNNING"}
      title={rows.map((row) => row.status.toLowerCase()).join(" · ")} />
  {/if}
{/snippet}

{#snippet origin(thread, daemon, columns = false)}
  <span class="nav-origin" class:nav-column={columns}>{daemon.slug} › {thread.mode?.slug ?? "—"}{bufferCount(thread) ? ` · ${bufferCount(thread)} buf` : ""}</span>
{/snippet}

{#snippet threadCard(item)}
  {@const { thread, daemon } = item}
  <span class="nav-card-names">
    <span class="nav-card-name"><ThreadLabel {thread} /></span>
    {@render origin(thread, daemon)}
  </span>
  <span class="nav-card-side">
    <span class="nav-meta">{META[sort](item)}</span>
    {@render badge(thread)}
  </span>
  <Key tone="ghost" size="mini" square label="✕" title="delete thread" onclick={(event) => discard(event, thread)} />
{/snippet}

{#snippet threadLine(item, columns)}
  {@const { thread, daemon } = item}
  <Row
    selected={$activeThread?.id === thread.id}
    title="click load · dbl-click quick-start · middle-click new terminal"
    onclick={() => loadThread(thread)}>
    <span class="nav-name" class:nav-column={columns}><ThreadLabel {thread} /></span>
    {@render origin(thread, daemon, columns)}
    <span class="nav-badge" class:nav-slot={columns}>{@render badge(thread)}</span>
    <span class="nav-meta" class:nav-slot={columns}>{META[sort](item)}</span>
    <Key tone="ghost" size="mini" square label="✕" title="delete thread" onclick={(event) => discard(event, thread)} />
  </Row>
{/snippet}

{#snippet groupHead(section, daemon, count)}
  <Row title="fold this daemon" onclick={() => toggleGroup(section, daemon.slug)}>
    <span class="nav-caret">{groupOpen(section, daemon.slug) ? "▾" : "▸"}</span>
    <span class="nav-group">{daemon.slug}</span>
    <span class="nav-meta">{count}</span>
  </Row>
{/snippet}

{#snippet viewKey(section)}
  <Key
    tone="ghost"
    size="mini"
    square
    label={GLYPHS[views[section]]}
    title="{views[section]} · click to cycle"
    onclick={(event) => cycle(event, section)} />
{/snippet}

<div class="nav">
  <div class="nav-head">
    <div class="nav-chips">
      {#if picked}
        <Key size="row" latched title="every daemon" onclick={() => pick(null)}>
          <Status tone={HEALTH[code($daemons.find((daemon) => daemon.slug === picked) ?? {})] ?? "idle"} />
          {picked} ×
        </Key>
        {#each kinds as name (name)}
          <Key size="row" led latched={kind === name} label={name} title="modes of this type" onclick={() => narrow(name)} />
        {/each}
      {:else}
        {#each $daemons as daemon (daemon.slug)}
          <Key size="row" title="{daemon.slug} · {code(daemon) || 'unknown'}" onclick={() => pick(daemon.slug)}>
            <Status tone={HEALTH[code(daemon)] ?? "idle"} pulse={code(daemon) === "mounting"} />
            {daemon.slug}
          </Key>
        {:else}
          <span class="nav-note">no daemons</span>
        {/each}
      {/if}
    </div>
    <div class="nav-tools">
      <div class="nav-filter" class:open={searching} role="presentation" onfocusin={() => (searching = true)} onfocusout={rest}>
        {#if !searching}
          <Key size="mini" square label="⌕" title="filter" onclick={seek} />
        {/if}
        <span class="nav-well" bind:this={well}>
          <Input bind:value={query} placeholder="filter" title="filter threads, modes and intents" oninput={() => (step = 0)} />
        </span>
      </div>
      <Key size="mini" title="sort · {sort} · click to cycle" onclick={() => (sort = SORTS[(SORTS.indexOf(sort) + 1) % SORTS.length])}>
        <span class="nav-pips">{#each SORTS as name (name)}<i class:lit={name === sort}></i>{/each}</span>
        {sort}
      </Key>
    </div>
  </div>

  <div class="nav-part">
    <Section label="change thread" count={matched.length} open={sections.threads} ontoggle={() => toggleSection("threads")}>
      {#snippet action()}{@render viewKey("threads")}{/snippet}
    </Section>
    {#if sections.threads}
      {#if !listed.length}
        <Empty verb={threads.length ? "no thread matches" : "no threads"} />
      {:else if views.threads === "card"}
        <div class="nav-cards">
          {#each listed as item (item.thread.id)}
            <div
              class="nav-seat"
              role="presentation"
              title="click load · dbl-click quick-start · middle-click new terminal"
              ondblclick={() => quickStart(item.thread)}
              onauxclick={(event) => onThreadAux(item.thread, event)}>
              {#if $activeThread?.id === item.thread.id}
                <Pressed><div class="nav-card">{@render threadCard(item)}</div></Pressed>
              {:else}
                <Card onclick={() => loadThread(item.thread)}><div class="nav-card">{@render threadCard(item)}</div></Card>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <div class="nav-lines">
          {#each listed as item (item.thread.id)}
            <div
              class="nav-seat"
              role="presentation"
              ondblclick={() => quickStart(item.thread)}
              onauxclick={(event) => onThreadAux(item.thread, event)}>
              {@render threadLine(item, views.threads === "table")}
            </div>
          {/each}
        </div>
      {/if}
      {#if more > 0}
        <div class="nav-more"><Key tone="ghost" size="mini" label="+ {more} more" title="show more threads" onclick={() => (step += 1)} /></div>
      {/if}
    {/if}
  </div>

  <div class="nav-part">
    <Section label="set mode" count={modes.length} open={sections.modes} ontoggle={() => toggleSection("modes")}>
      {#snippet action()}{@render viewKey("modes")}{/snippet}
    </Section>
    {#if sections.modes}
      {#if views.modes === "card"}
        <div class="nav-keys">
          {#each modes as { mode, daemon } (`${daemon.slug}/${mode.id}`)}
            <Key size="field" wide latched={worn(daemon, mode)} title="click · new thread (same daemon: re-mode)" onclick={() => selectMode(daemon, mode)}>
              <Status tone={HEALTH[code(mode)] ?? "idle"} />
              <span class="nav-name">{mode.slug}</span>
              <span class="nav-kind">{mode.type}</span>
            </Key>
          {/each}
        </div>
      {:else}
        <div class="nav-lines">
          {#each modes as { mode, daemon } (`${daemon.slug}/${mode.id}`)}
            <Row selected={worn(daemon, mode)} title="click · new thread (same daemon: re-mode)" onclick={() => selectMode(daemon, mode)}>
              <Status tone={HEALTH[code(mode)] ?? "idle"} />
              <span class="nav-name" class:nav-column={views.modes === "table"}>{mode.slug}</span>
              {#if views.modes === "table"}<span class="nav-origin">{daemon.slug}</span>{/if}
              <span class="nav-kind">{mode.type}</span>
            </Row>
          {/each}
        </div>
      {/if}
      {#if !modes.length && !mounting.length}
        <Empty verb="no modes" />
      {/if}
      {#if mounting.length}
        <span class="nav-note">{mounting.join(" · ")} · modes arrive on mount</span>
      {/if}
    {/if}
  </div>

  <div class="nav-part">
    <Section label="intents" count={offers.length || null} open={sections.intents} ontoggle={() => toggleSection("intents")} />
    {#if sections.intents}
      {#if !offers.length}
        <Empty verb="no intents" />
      {:else}
        <div class="nav-lines">
          {#each availableDaemons as daemon (daemon.slug)}
            {@const daemonIntents = offers.filter((item) => item.daemon.slug === daemon.slug)}
            {#if daemonIntents.length}
              {@render groupHead("intents", daemon, daemonIntents.length)}
              {#if groupOpen("intents", daemon.slug)}
                {#each daemonIntents as { intent } (intent.id)}
                  <Row title="click · new thread from this intent" onclick={() => activateIntent(daemon, intent)}>
                    <span class="nav-name nav-inset">{intent.name ?? intent.slug}</span>
                    <span class="nav-kind">{intent.mode?.slug ?? ""}</span>
                  </Row>
                {/each}
              {/if}
            {/if}
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .nav {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    padding: 6px 4px 4px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-strong);
  }
  .nav-head {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  }
  .nav-chips {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .nav-tools {
    flex: none;
    display: flex;
    align-items: center;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .nav-filter {
    display: flex;
    align-items: center;
  }
  .nav-well {
    display: block;
    width: 0;
    overflow: hidden;
    transition: width 0.12s;
  }
  .nav-filter.open .nav-well {
    width: 118px;
  }
  .nav-pips {
    display: inline-flex;
    gap: 2px;
  }
  .nav-pips i {
    width: 4px;
    height: 4px;
    border-radius: var(--shape-radius-full);
    background: var(--boundary);
  }
  .nav-pips i.lit {
    background: var(--signal-primary-ink);
  }
  .nav-part {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .nav-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .nav-card {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .nav-card-names {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .nav-card-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-family-sans-text);
    font-size: var(--size-type-xs);
  }
  .nav-card-side {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
  .nav-lines {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .nav-keys {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .nav-seat {
    min-width: 0;
  }
  .nav-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .nav-name.nav-column,
  .nav-origin.nav-column {
    flex: 1 1 0;
  }
  .nav-slot {
    flex: 0 0 44px;
    justify-content: flex-end;
    text-align: right;
  }
  .nav-name.nav-inset {
    padding-left: 14px;
  }
  .nav-origin {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-light);
  }
  .nav-badge {
    flex: none;
    display: inline-flex;
  }
  .nav-meta,
  .nav-kind {
    flex: none;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
  .nav-kind {
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
  }
  .nav-caret {
    flex: none;
    width: 8px;
    color: var(--text-light);
  }
  .nav-group {
    flex: 1;
    min-width: 0;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-light);
  }
  .nav-more {
    display: flex;
    justify-content: center;
  }
  .nav-note {
    color: var(--text-light);
    line-height: var(--size-leading-loose);
  }
</style>
