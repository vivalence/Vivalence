<script>
  import { getContext } from "svelte";
  import { chain, stores, dictation } from "@vivalence/kajuit";
  import { soma } from "@vivalence/typology";
  import { TERMINALS, BRIDGE, BOX } from "$client";
  import { Json } from "@vivalence/drapes";
  import Markdown from "./Markdown.svelte";
  import Dictaphone from "./Dictaphone.svelte";
  import { spliceAt } from "./dictate.js";
  import {
    turnText,
    turnThinking,
    turnTools,
    turnArtifacts,
    toolResults,
    isToolTurn,
    toolCensus,
    toolChannels,
    toolBuffers,
    toolDigest,
    turnCensus,
    scalarPairs,
    bufferLabel,
    turnClipboard,
    turnManifest,
    sessionUsage,
    contextSize,
    tokens,
  } from "./turns.js";

  let { thread } = $props();

  const terminals = getContext(TERMINALS);
  const bridge = getContext(BRIDGE);
  const box = getContext(BOX);

  // reactive reads via chain from the STABLE terminals root (survives thread switches).
  const turnsStore = chain(terminals, "$active", "$thread", "$turns");
  const modeStore = chain(terminals, "$active", "$thread", "$mode");
  const dockStore = chain(terminals, "$active", "$dock");
  const buffersStore = chain(terminals, "$active", "$thread", "$buffers");
  const traitStore = chain(terminals, "$active", "$thread", "$trait");
  const composerStore = bridge.$composer;

  let turns = $derived($turnsStore ?? []);
  let thinkMode = $derived($traitStore?.INTELLIGENT?.thinking);
  let harnessed = $derived($modeStore?.implements?.("HARNESSED") ?? false);
  let verbatim = $derived(harnessed && ($modeStore?.daemon?.cortex?.find({ type: "verbatim", via: "stream" }).length ?? 0) > 0);

  const recorder = dictation({ terminals, box });
  const dictating = recorder.$active;
  const committed = recorder.$committed;
  const tail = recorder.$tail;
  const dictationFault = recorder.$error;
  const level = box.device.microphone.$level;
  let anchor = 0;
  const listening = $derived($dictating !== "idle");
  let full = $derived($dockStore?.full ?? false);

  // in-flight = pure view state. history is thread.$turns (the repo). the user turn is minted
  // here with a client id and persisted under it → the repo delivers the SAME id → echo drops
  // on identity, no content-match. `live` = the running fold (soma.scan), null when idle.
  let live = $state(null);
  let echo = $state(null);
  let sending = $state(false);
  let error = $state(null);
  let inflight = null; // stop() only; NOT aborted on unmount — the fold finishes + persists

  let draft = $state("");
  let textareaEl = $state(null);
  let dockHeight = $state(0);
  let dockWidth = $state(0);
  let logEl = $state(null);
  let pinned = $state(true);
  let unread = $state(0);

  let opened = $state({});
  let metaOpen = $state(false);
  let railOpen = $state(false);
  let railSize = $state(320);
  let tab = $state("activity");
  let elapsed = $state(0);
  let seam = null;

  const ROWS = 8;
  const CONSOLES = ["context", "meter", "activity"];
  const isOpen = (key, fallback = false) => opened[key] ?? fallback;
  const caret = (key, fallback = false) => (isOpen(key, fallback) ? "▾" : "▸");

  function toggle(key, fallback = false) {
    opened = { ...opened, [key]: !isOpen(key, fallback) };
    pinBottom();
  }

  function openConsole(name) {
    if (railOpen && tab === name) return (railOpen = false);
    tab = name;
    railOpen = true;
  }

  // orientation flips at 820px: side rail 280–680px, stacked rail 140px–55vh
  const narrow = $derived(dockWidth > 0 && dockWidth < 820);
  const railExtent = $derived(
    narrow
      ? Math.min(railSize, Math.max(140, Math.round(dockHeight * 0.55)))
      : Math.min(railSize, 680, Math.max(280, Math.round(dockWidth * 0.7))),
  );

  function seamDown(event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    seam = { x: event.clientX, y: event.clientY };
  }

  function seamMove(event) {
    if (!seam) return;
    const dx = event.clientX - seam.x;
    const dy = event.clientY - seam.y;
    seam = { x: event.clientX, y: event.clientY };
    railSize = narrow
      ? Math.max(140, Math.min(Math.round(dockHeight * 0.55), railSize + dy))
      : Math.max(280, Math.min(680, railSize - dx));
  }

  function seamUp(event) {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
    seam = null;
  }

  const bufferIds = $derived(new Set(($buffersStore ?? []).map((buffer) => buffer.id)));

  function launch(row) {
    const terminal = terminals.active;
    const buffer = ($buffersStore ?? []).find((candidate) => candidate.id === row.id);
    if (!terminal || !buffer) return;
    terminal.buffer = buffer;
    if (full) stores.bridge.setDockFull(terminal.$dock, false);
  }

  function launchLabel(row) {
    const managed = ($buffersStore ?? []).find((candidate) => candidate.id === row.id) ?? row;
    const named = managed?.data?.label ?? managed?.data?.title ?? managed?.label;
    if (named) return named;
    const modeId = typeof managed?.mode === "string" ? managed.mode : managed?.mode?.id;
    const modes = $modeStore?.daemon?.entities?.mode?.$entities?.get() ?? [];
    const slug = managed?.mode?.slug ?? modes.find((mode) => mode.id === modeId)?.slug;
    return slug ?? bufferLabel(managed);
  }

  const coarsePointer = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
  const enterSends = $derived(!coarsePointer && ($composerStore?.enterSends ?? true));
  const hint = $derived(coarsePointer ? "message…" : enterSends ? "message… (shift+enter for newline)" : "message… (enter for newline, shift+enter sends)");

  const isStreaming = $derived(!!live);
  const isThinking = $derived(sending && !live);
  const busy = $derived(sending || !!live);
  const showEcho = $derived(!!echo && !turns.some((t) => t.id === echo.id));

  const liveItem = $derived(live ? project(live) : null);
  const liveCall = $derived(liveItem?.tools.find((tool) => tool.status === "running")?.name ?? null);
  const elapsedLabel = $derived(`${elapsed.toFixed(1)}s`);

  $effect(() => {
    if (!busy) return;
    const begun = Date.now();
    elapsed = 0;
    const ticker = setInterval(() => (elapsed = (Date.now() - begun) / 1000), 100);
    return () => clearInterval(ticker);
  });

  function project(turn, results) {
    const tools = turnTools(turn, results ?? toolResults([turn])).map((tool) => ({
      ...tool,
      census: toolCensus(tool.entities),
      digest: toolDigest(tool.input),
      channels: toolChannels(tool),
    }));
    return {
      text: turnText(turn),
      think: turnThinking(turn),
      tools,
      census: turnCensus(tools),
      failures: tools.filter((tool) => tool.status === "error").length,
      artifacts: turnArtifacts(turn),
      buffers: toolBuffers(tools),
    };
  }

  function dictate() {
    anchor = textareaEl?.selectionStart ?? draft.length;
    recorder.start();
  }

  async function settle() {
    recorder.stop();
    await recorder.settled();
    const text = recorder.$committed.get();
    if (!text) return;
    const spliced = spliceAt(draft, anchor, text);
    draft = spliced.draft;
    requestAnimationFrame(() => {
      textareaEl?.focus();
      if (textareaEl) textareaEl.selectionStart = textareaEl.selectionEnd = spliced.caret;
    });
  }

  $effect(() => {
    const unswitch = chain(terminals, "$active", "$thread").subscribe(() => recorder.cancel());
    return () => {
      unswitch();
      recorder.cancel();
    };
  });

  async function send() {
    if (!draft.trim() || !harnessed || sending) return;
    const parts = [{ type: "text", text: draft.trim() }];
    draft = "";
    error = null;
    const id = crypto.randomUUID();
    echo = { id, role: "user", parts, createdAt: new Date().toISOString() };
    sending = true;
    pinned = true;
    pinBottom();
    textareaEl?.focus();

    inflight = new AbortController();
    try {
      for await (const turn of soma.scan(
        thread.mode.harness.dialogue.stream({ thread: thread.id, id, parts }, { signal: inflight.signal }),
      )) {
        live = { ...turn }; // new ref per packet → Svelte reacts (shallow copy at the view)
        pinBottom();
      }
    } catch (err) {
      if (err.name !== "AbortError") error = err.message;
    } finally {
      live = null;
      echo = null;
      sending = false;
      inflight = null;
    }
  }

  const stop = () => inflight?.abort();

  function lastUserText() {
    for (let i = turns.length - 1; i >= 0; i -= 1) {
      if (turns[i]?.role === "user") return turnText(turns[i]);
    }
    return null;
  }

  function recallLastUser() {
    const text = lastUserText();
    if (!text) return;
    draft = text;
    if (textareaEl) {
      textareaEl.focus();
      requestAnimationFrame(() => {
        textareaEl.selectionStart = textareaEl.selectionEnd = draft.length;
      });
    }
  }

  function onKey(event) {
    if (event.key === "Enter") {
      const wantsSend = enterSends ? !event.shiftKey : event.shiftKey;
      if (wantsSend) {
        event.preventDefault();
        send();
        return;
      }
    } else if (event.key === "ArrowUp" && draft === "") {
      event.preventDefault();
      recallLastUser();
    } else if (event.key === "Escape" && listening) {
      event.preventDefault();
      recorder.cancel();
    } else if (event.key === "Escape" && (isStreaming || sending)) {
      event.preventDefault();
      stop();
    }
  }

  let copied = $state(null);

  async function toClipboard(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const done = document.execCommand ? document.execCommand("copy") : false;
    area.remove();
    return done;
  }

  async function copyTurn(turn, tools) {
    copied = (await toClipboard(turnClipboard(turn, tools))) ? turn.id : null;
    setTimeout(() => (copied = null), 1200);
  }

  function retryUser(turn) {
    const text = turnText(turn);
    if (!text) return;
    draft = text;
    send();
  }

  function isAtBottom(el) {
    if (!el) return true;
    const slack = 24;
    return el.scrollTop + el.clientHeight >= el.scrollHeight - slack;
  }

  let lastScrollTop = 0;
  function onScroll() {
    if (!logEl) return;
    const top = logEl.scrollTop;
    if (isAtBottom(logEl)) {
      pinned = true;
      unread = 0;
    } else if (top < lastScrollTop) {
      pinned = false;
    }
    lastScrollTop = top;
  }

  let pinQueued = false;
  function pinBottom() {
    if (pinQueued) return;
    pinQueued = true;
    requestAnimationFrame(() => {
      pinQueued = false;
      if (pinned && logEl) logEl.scrollTop = logEl.scrollHeight;
    });
  }

  let lastCount = 0;
  $effect(() => {
    const len = enrichedTurns.filter((item) => item.kind === "turn").length + (isStreaming ? 1 : 0);
    if (pinned) pinBottom();
    else if (len > lastCount) unread += len - lastCount;
    lastCount = len;
  });

  $effect(() => {
    if (!logEl) return;
    const observer = new ResizeObserver(pinBottom);
    observer.observe(logEl);
    return () => observer.disconnect();
  });

  function turnDate(turn) {
    const value = turn?.createdAt ? new Date(turn.createdAt) : null;
    if (!value || Number.isNaN(value.getTime())) return null;
    return value;
  }

  function dayKey(date) {
    if (!date) return "";
    return date.toISOString().slice(0, 10);
  }

  function dayLabel(date) {
    if (!date) return "";
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (dayKey(date) === dayKey(today)) return "today";
    if (dayKey(date) === dayKey(yesterday)) return "yesterday";
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  function clockTime(date) {
    if (!date) return "";
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  const enrichedTurns = $derived.by(() => {
    const source = showEcho ? [...turns, echo] : turns;
    const results = toolResults(source);
    const items = [];
    let prevDay = null;
    for (const turn of source) {
      if (isToolTurn(turn)) continue;
      const projected = project(turn, results);
      if (!projected.text && !projected.tools.length && !projected.artifacts.length) continue;
      const date = turnDate(turn);
      const day = dayKey(date);
      if (date && day !== prevDay) {
        items.push({ kind: "divider", id: `div-${day}`, label: dayLabel(date) });
        prevDay = day;
      }
      const prior = items.at(-1);
      if (turn.role === "assistant" && prior?.kind === "turn" && prior.turn.role === "assistant") {
        prior.tools = [...prior.tools, ...projected.tools];
        prior.text = [prior.text, projected.text].filter(Boolean).join("\n\n");
        prior.think = [prior.think, projected.think].filter(Boolean).join("\n\n");
        prior.failures += projected.failures;
        prior.artifacts = [...prior.artifacts, ...projected.artifacts];
        prior.buffers = [...prior.buffers, ...projected.buffers];
        prior.census = turnCensus(prior.tools);
        continue;
      }
      items.push({ kind: "turn", turn, date, ...projected });
    }
    return items;
  });

  const exchanges = $derived(
    enrichedTurns.filter((item) => item.kind === "turn" && (item.tools.length || item.think)),
  );
  const callCount = $derived(exchanges.reduce((total, item) => total + item.tools.length, 0));
  const roster = $derived([
    ...new Set(exchanges.flatMap((item) => item.tools.map((tool) => tool.name))),
  ]);
  const manifest = $derived(
    enrichedTurns
      .filter((item) => item.kind === "turn")
      .map((item) => ({
        id: item.turn.id,
        who: item.turn.role === "user" ? "you" : (thread?.label?.name ?? "agent"),
        time: clockTime(item.date),
        parts: turnManifest(item.turn).join(" · "),
      })),
  );
  const spend = $derived(sessionUsage(turns));
  const held = $derived(contextSize(turns));
  // every entity the session touched, summed — a count, so it lives in the console
  const harvest = $derived(turnCensus(exchanges.flatMap((item) => item.tools)));
</script>

{#snippet callRow(tool, base)}
  {@const failed = tool.status === "error"}
  {@const running = tool.status === "running"}
  <div class="call" class:failed class:running>
    <button type="button" class="call-head" class:inert={running} onclick={() => !running && toggle(base, failed)}>
      {#if running}
        <span class="beacon"></span>
      {:else}
        <span class="fold">{caret(base, failed)}</span>
      {/if}
      <span class="call-name">{tool.name}</span>
      <span class="call-args">{tool.digest}</span>
      <span class="grow"></span>
      {#if !running}
        <span class="call-status {tool.status}">{tool.status}</span>
      {/if}
    </button>
    {#if !running && isOpen(base, failed)}
      <div class="call-body">
        {#if tool.output !== null && tool.output !== undefined}
          {#if typeof tool.output === "string"}
            <pre class="call-output">{tool.output}</pre>
          {:else}
            <div class="scroll"><Json value={tool.output} openDepth={1} /></div>
          {/if}
        {/if}
        {#each tool.channels as channel (channel.key)}
          {@const key = `${base}/${channel.key}`}
          {@const all = `${key}/all`}
          {@const pairs = channel.rows ? null : scalarPairs(channel.value)}
          <div class="chan">
            <button type="button" class="chan-head" onclick={() => toggle(key)}>
              <span class="fold">{caret(key)}</span>
              <span class="chan-key">{channel.key}</span>
              <span class="chan-sum">{channel.summary}</span>
            </button>
            {#if isOpen(key)}
              {#if channel.rows}
                {@const rows = isOpen(all) ? channel.rows : channel.rows.slice(0, ROWS)}
                {@const detailed = channel.rows.some((row) => row.gloss || row.band)}
                <div class="rows">
                  {#each rows as row, ri (row.id ?? ri)}
                    <div class="row">
                      <span class="row-term">{row.term}</span>
                      <span class="row-kind">{row.kind}</span>
                      {#if detailed}
                        <span class="row-gloss">{row.gloss}</span>
                        <span class="row-meter">
                          {#if row.band}
                            <span class="bar {row.band}"><span style:width="{Math.round((row.fill ?? 0) * 100)}%"></span></span>
                            <span class="band {row.band}">{row.band}</span>
                          {/if}
                        </span>
                      {/if}
                      {#if row.launchable}
                        <button type="button" class="launch" disabled={!bufferIds.has(row.id)} onclick={() => launch(row)}>▶ run</button>
                      {/if}
                    </div>
                  {/each}
                  {#if channel.rows.length > ROWS}
                    <button type="button" class="more" onclick={() => toggle(all)}>
                      {isOpen(all) ? "less" : `${channel.rows.length - ROWS} more…`}
                    </button>
                  {/if}
                </div>
              {:else if pairs}
                <div class="pairs">
                  {#each pairs as pair (pair.key)}
                    <span class="pair-key">{pair.key}</span><span class="pair-value">{pair.value}</span>
                  {/each}
                </div>
              {:else}
                <div class="scroll chan-body"><Json value={channel.value} openDepth={1} /></div>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet activity(item, base)}
  {#if item.think && thinkMode == null}
    {@const key = `${base}/think`}
    <div class="chan">
      <button type="button" class="chan-head" onclick={() => toggle(key)}>
        <span class="fold">{caret(key)}</span>
        <span class="chan-key">thinking</span>
      </button>
      {#if opened[key]}<div class="think">{item.think}</div>{/if}
    </div>
  {/if}
  {#each item.tools as tool, ti (ti)}
    {@render callRow(tool, `${base}/c${ti}`)}
  {/each}
{/snippet}

{#snippet chips(item)}
  {#if item.buffers.length}
    <div class="launchers">
      {#each item.buffers as buffer (buffer.id)}
        <button type="button" class="launch" disabled={!bufferIds.has(buffer.id)} onclick={() => launch(buffer)}>▶ {launchLabel(buffer)}</button>
      {/each}
    </div>
  {/if}
{/snippet}

<div class="dock" bind:clientHeight={dockHeight} bind:clientWidth={dockWidth}>
  <header>
    <button class="dock-close" onclick={() => stores.bridge.setDockCollapsed(terminals.active?.$dock)} title="collapse" aria-label="collapse dock">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </button>
    <button class="dock-full" onclick={() => stores.bridge.setDockFull(terminals.active?.$dock)} title={full ? "restore" : "full screen"} aria-label={full ? "restore dock" : "expand dock to full panel"}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {#if full}
          <path d="M10 4v6H4" />
          <path d="M14 20v-6h6" />
        {:else}
          <path d="M4 10V4h6" />
          <path d="M20 14v6h-6" />
        {/if}
      </svg>
    </button>
    <span class="pip" class:live={harnessed}></span>
    <span class="title">{thread?.label?.name ?? "session"}</span>
    <span class="dock-spacer"></span>
    {#if liveCall}
      <span class="state calling">calling <b>{liveCall}</b><span class="elapsed">{elapsedLabel}</span></span>
    {:else if isStreaming}
      <span class="state streaming">streaming<span class="elapsed">{elapsedLabel}</span></span>
    {:else if isThinking}
      <span class="state thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span>thinking</span>
    {:else}
      <span class="state">idle</span>
    {/if}
    <button
      type="button"
      class="meta-toggle"
      class:on={metaOpen}
      onclick={() => {
        metaOpen = !metaOpen;
        if (!metaOpen) railOpen = false;
      }}
      aria-label="toggle meta bar">⋮⋮ meta</button>
  </header>

  {#if metaOpen}
    <div class="meta">
      {#each CONSOLES as name (name)}
        <button type="button" class="rail-chip" class:on={railOpen && tab === name} onclick={() => openConsole(name)}>{name}</button>
      {/each}
    </div>
  {/if}

  <div class="sweep"></div>

  <div class="split" class:narrow>
  <div class="stream">
  <div class="log" bind:this={logEl} onscroll={onScroll}>
    {#each enrichedTurns as item, index (item.id ?? item.turn?.id ?? index)}
      {#if item.kind === "divider"}
        <div class="day-divider"><span>{item.label}</span></div>
      {:else}
        {@const turn = item.turn}
        {@const fold = `${turn.id}/open`}
        {@const rich = item.tools.length > 0 || (!!item.think && thinkMode == null)}
        <div class="entry" class:user={turn.role === "user"} class:agent={turn.role === "assistant"}>
          <div class="entry-meta">
            {#if turn.role === "assistant"}
              <button type="button" class="head" class:inert={!rich} onclick={() => rich && toggle(fold)}>
                {#if rich}<span class="fold">{caret(fold)}</span>{/if}
                <span class="diamond">◆</span>
                <span class="who">{thread?.label?.name ?? "agent"}</span>
                {#if item.date}<span class="time" title={item.date.toLocaleString()}>{clockTime(item.date)}</span>{/if}
                {#if item.think && thinkMode == null}<span class="tool-count">thought</span>{/if}
                {#if item.tools.length}<span class="tool-count">{item.tools.length} {item.tools.length === 1 ? "tool" : "tools"}</span>{/if}
                {#if !isOpen(fold)}
                  {#if item.failures}<span class="chip bad">{item.failures} failed</span>{/if}
                {/if}
              </button>
            {:else}
              {#if item.date}<span class="time" title={item.date.toLocaleString()}>{clockTime(item.date)}</span><span class="sep">·</span>{/if}
              <span class="who">you</span>
            {/if}
            <span class="actions">
              <button type="button" class="action" title="copy" onclick={() => copyTurn(turn, item.tools)}>{copied === turn.id ? "copied" : "copy"}</button>
              {#if turn.role === "user"}
                <button type="button" class="action" title="resend" onclick={() => retryUser(turn)}>retry</button>
              {/if}
            </span>
          </div>
          {#if rich && isOpen(fold)}
            <div class="activity">{@render activity(item, turn.id)}</div>
          {/if}
          {@render chips(item)}
          {#if item.think && thinkMode === true}
            <div class="think inline">{item.think}</div>
          {/if}
          {#if item.text}
            <div class="text"><Markdown text={item.text} /></div>
          {/if}
          {#if item.artifacts.length}
            <div class="artifacts">
              {#each item.artifacts as art, ai (ai)}
                {#if art.type === "image" && art.source?.data}
                  <img class="artifact-img" src={art.source.data} alt={art.alt ?? "image"} />
                {:else if art.type === "audio" && art.url}
                  <audio class="artifact-audio" controls src={art.url}></audio>
                {:else}
                  <a class="artifact-card" href={art.url ?? "#"} target="_blank" rel="noreferrer noopener">
                    <span class="artifact-glyph">◈</span>
                    <span class="artifact-name">{art.name ?? art.url ?? art.type}</span>
                  </a>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    {/each}

    {#if liveItem}
      <div class="entry agent streaming-entry">
        <div class="entry-meta">
          <span class="diamond">◆</span>
          <span class="who">{thread?.label?.name ?? "agent"}</span>
          <span class="time"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>
        </div>
        {#if liveItem.tools.length || (liveItem.think && thinkMode == null)}
          <div class="activity">{@render activity(liveItem, "live")}</div>
        {/if}
        {@render chips(liveItem)}
        {#if liveItem.think && thinkMode === true}
          <div class="think inline">{liveItem.think}</div>
        {/if}
        {#if liveItem.text}
          <div class="text live"><Markdown text={liveItem.text} /></div>
        {/if}
      </div>
    {:else if isThinking}
      <div class="entry agent streaming-entry">
        <div class="entry-meta">
          <span class="diamond">◆</span>
          <span class="who">{thread?.label?.name ?? "agent"}</span>
          <span class="time"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>
        </div>
      </div>
    {/if}

    {#if !turns.length && !live && !isThinking}
      <div class="placeholder">{harnessed ? "begin" : "no harness"}</div>
    {/if}

    <div class="anchor"></div>
  </div>

  {#if error}
    <div class="error-bar" title={error}>error: {error}</div>
  {/if}

  <div class="composer">
    {#if listening}
      <div class="dictation-ghost">
        <span class="mark"></span>
        <span class="settled">{$committed}</span>{#if $tail}<span class="volatile">&nbsp;{$tail}</span>{/if}
      </div>
    {/if}
    {#if !pinned}
      <button type="button" class="new-pill" class:quiet={unread === 0} onpointerdown={(event) => event.preventDefault()} onclick={() => { pinned = true; pinBottom(); unread = 0; }} aria-label="scroll to bottom">
        ↓{#if unread > 0}&nbsp;{unread} new{/if}
      </button>
    {/if}
    <textarea
      bind:this={textareaEl}
      class="input"
      bind:value={draft}
      onkeydown={onKey}
      placeholder={harnessed ? hint : "—"}
      disabled={!harnessed}
      readonly={listening}
      rows="1"
      style:max-height="{Math.max(112, Math.round(dockHeight * 0.6))}px"></textarea>

    {#if verbatim}
      <Dictaphone
        active={dictating}
        {level}
        fault={$dictationFault}
        disabled={sending}
        onstart={dictate}
        onstop={settle} />
    {/if}
    {#if isStreaming || sending}
      <button class="send stop" onclick={stop} onpointerdown={(event) => event.preventDefault()} title={coarsePointer ? "stop" : "stop (esc)"} aria-label="stop">
        <svg viewBox="0 0 24 24">
          <rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" />
        </svg>
      </button>
    {:else}
      <button class="send" onclick={send} onpointerdown={(event) => event.preventDefault()} disabled={!harnessed || !draft.trim()} title={coarsePointer ? "send" : "send (enter)"} aria-label="send">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 10 4 15 9 20" />
          <path d="M20 4v7a4 4 0 0 1-4 4H4" />
        </svg>
      </button>
    {/if}
  </div>
  </div>

  {#if railOpen}
    <div
      class="seam"
      onpointerdown={seamDown}
      onpointermove={seamMove}
      onpointerup={seamUp}
      onpointercancel={seamUp}
      role="separator"
      aria-label="resize console"
      aria-orientation={narrow ? "horizontal" : "vertical"}
    ></div>
    <aside class="rail" style:flex-basis="{railExtent}px">
      <div class="rail-body">
        {#if tab === "activity"}
          <div class="rail-head"><span>session calls</span><span>{callCount} · {exchanges.length} turns</span></div>
          {#each exchanges as item (item.turn.id)}
            <div class="exchange">
              <div class="exchange-head">
                <span class="diamond">◆</span>
                <span>{clockTime(item.date)}</span>
                <span class="grow"></span>
                <span>{item.tools.length} {item.tools.length === 1 ? "call" : "calls"}</span>
              </div>
              {@render activity(item, item.turn.id)}
            </div>
          {/each}
          {#if !exchanges.length}<div class="rail-empty">no calls yet</div>{/if}
        {:else if tab === "context"}
          <div class="rail-head"><span>tools declared</span><span>{roster.length}</span></div>
          <div class="rail-list">
            {#each roster as name (name)}<div class="rail-row"><span class="call-name">{name}</span></div>{/each}
            {#if !roster.length}<div class="rail-empty">none seen this thread</div>{/if}
          </div>
          <div class="rail-head"><span>turn manifest</span><span>{manifest.length} turns</span></div>
          <div class="rail-list">
            {#each manifest as entry (entry.id)}
              <div class="rail-row"><span>{entry.who} · {entry.time}</span><span class="chan-sum">{entry.parts}</span></div>
            {/each}
          </div>
        {:else}
          <div class="rail-head"><span>meter</span><span>{thread?.mode?.slug ?? ""}</span></div>
          <div class="rail-grid">
            <span>turns</span><span>{manifest.length}</span>
            <span>calls</span><span>{callCount}</span>
            <span>tools</span><span>{roster.length}</span>
            {#each harvest as entry (entry.type)}
              <span>{entry.type}</span><span>{entry.count}</span>
            {/each}
            {#if spend.seen}
              <span>tokens in</span><span>{tokens(spend.input)}</span>
              <span>tokens out</span><span>{tokens(spend.output)}</span>
              {#if held != null}<span>context</span><span>{tokens(held)}</span>{/if}
            {/if}
            {#if busy}<span>elapsed</span><span>{elapsedLabel}</span>{/if}
          </div>
          {#if !spend.seen}
            <div class="rail-empty">no usage on the wire — needs m23 I.2</div>
          {/if}
        {/if}
      </div>
    </aside>
  {/if}
  </div>
</div>

<style>
  .dock {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    position: relative;

    /* dapper declares themes.nordic.text {primary, body, support} but emits no CSS var
       for it — derive the two lower rungs against this zone's own ground so they land
       at the same contrast in paper and nordic. mixing toward surface, never toward
       transparent: transparent composites over whatever sits behind the dock. */
    --text-body: color-mix(in srgb, var(--colors-skeleton-2-contrast) 76%, var(--colors-skeleton-2-surface));
    --text-support: color-mix(in srgb, var(--colors-skeleton-2-contrast) 55%, var(--colors-skeleton-2-surface));
  }
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--colors-skeleton-2-boundary);
    flex-shrink: 0;
    font-size: var(--font-size-xs);
    letter-spacing: 0.06em;
  }
  .title {
    text-transform: lowercase;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.85;
  }
  .dock-close,
  .dock-full {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-support);
    transition: color 0.16s;
  }
  .dock-close svg {
    width: 15px;
    height: 15px;
    display: block;
  }
  .dock-full svg {
    width: 13px;
    height: 13px;
    display: block;
  }
  .dock-close:hover,
  .dock-full:hover {
    color: var(--colors-skeleton-0-primary-base);
  }
  .pip {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-2-boundary);
    flex-shrink: 0;
    transition: background 0.16s, box-shadow 0.16s;
  }
  .pip.live {
    background: var(--colors-skeleton-0-primary-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-primary-base);
  }
  .dock-spacer {
    flex: 1;
  }
  .state {
    color: var(--text-support);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    padding-left: 6px;
  }
  .state.streaming, .state.thinking {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
  .state.thinking .dot:last-of-type {
    margin-right: 4px;
  }
  .meta-toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-primary-base) 40%, transparent);
    border-radius: 2px;
    color: var(--colors-skeleton-0-primary-base);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.06em;
    cursor: pointer;
    opacity: 0.7;
  }
  .meta-toggle:hover, .meta-toggle.on {
    opacity: 1;
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 10%, transparent);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .meta {
    display: flex;
    align-items: stretch;
    gap: 8px;
    padding: 0 14px 8px;
    padding-left: max(14px, calc((100% - 640px) / 2));
    padding-right: max(14px, calc((100% - 640px) / 2));
    flex-shrink: 0;
    font-size: var(--font-size-2xs);
  }

  .log {
    flex: 1;
    overflow-y: auto;
    padding: 14px 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    font-size: var(--font-size-sm);
    line-height: 1.55;
    letter-spacing: 0.01em;
  }
  .log > :not(.anchor) {
    overflow-anchor: none;
  }
  /* side-console width: the log holds a 640px measure and centres inside it */
  .split:not(.narrow) .log {
    padding-left: max(14px, calc((100% - 640px) / 2));
    padding-right: max(14px, calc((100% - 640px) / 2));
  }
  .anchor {
    overflow-anchor: auto;
    height: 1px;
    flex-shrink: 0;
    margin-top: -12px;
  }
  .day-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 4px 0;
    color: var(--text-support);
  }
  .day-divider::before, .day-divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--colors-skeleton-2-boundary);
  }
  .day-divider span {
    padding: 0 8px;
    font-size: var(--font-size-2xs);
    text-transform: lowercase;
    letter-spacing: 0.12em;
  }

  .entry {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: stretch;
    max-width: 100%;
    position: relative;
  }
  .entry.user {
    align-items: flex-end;
  }
  .entry.agent {
    align-items: flex-start;
  }
  .entry-meta {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: var(--font-size-xs);
    text-transform: lowercase;
    letter-spacing: 0.12em;
  }
  .who {
    color: var(--text-support);
  }
  .entry.user .who {
    color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 70%, var(--colors-skeleton-2-contrast));
    opacity: 0.6;
  }
  .time {
    color: var(--text-support);
    font-size: var(--font-size-2xs);
  }
  .sep {
    color: var(--text-support);
  }
  .diamond {
    color: var(--colors-skeleton-0-primary-base);
    font-size: var(--font-size-2xs);
    opacity: 0.7;
  }
  .tool-count {
    color: var(--text-support);
    font-size: var(--font-size-2xs);
  }
  .actions {
    margin-left: auto;
    display: inline-flex;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.16s;
  }
  .entry:hover .actions {
    opacity: 1;
  }
  .action {
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    text-transform: lowercase;
    letter-spacing: 0.12em;
    cursor: pointer;
    color: var(--text-support);
    padding: 0;
  }
  .action:hover {
    color: var(--colors-skeleton-0-primary-base);
  }

  .text {
    word-break: break-word;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-sans-text);
    line-height: 1.5;
  }
  .entry.user .text {
    color: var(--colors-skeleton-0-contrast);
    max-width: 85%;
    padding: 8px 12px;
    border: 1px solid var(--colors-skeleton-3-boundary);
    border-radius: 8px;
    background: var(--colors-skeleton-1-surface);
  }
  .entry.agent .text {
    color: var(--colors-skeleton-2-contrast);
    max-width: 92%;
  }
  .text.live :global(> :last-child)::after {
    content: "▍";
    color: var(--colors-skeleton-0-primary-base);
    margin-left: 2px;
  }

  .sweep {
    height: 1px;
    flex-shrink: 0;
    background: var(--colors-skeleton-2-boundary);
    overflow: hidden;
    position: relative;
  }
  .split {
    flex: 1;
    min-height: 0;
    display: flex;
  }
  .split.narrow {
    flex-direction: column-reverse;
  }
  .stream {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .seam {
    flex: 0 0 4px;
    background: var(--colors-skeleton-2-boundary);
    cursor: ew-resize;
    touch-action: none;
  }
  .split.narrow .seam {
    cursor: ns-resize;
  }
  .seam:hover {
    background: var(--colors-skeleton-0-primary-base);
  }
  .rail {
    flex-grow: 0;
    flex-shrink: 0;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: var(--colors-skeleton-1-surface);
  }
  .rail-chip {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    background: transparent;
    font-family: var(--font-family-code);
    font-size: inherit;
    line-height: var(--line-height-2xs);
    letter-spacing: 0.08em;
    cursor: pointer;
    color: var(--text-support);
  }
  .rail-chip:hover, .rail-chip.on {
    color: var(--colors-skeleton-0-primary-base);
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 50%, transparent);
  }
  .rail-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: var(--font-size-xs);
  }
  .rail-head {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.1em;
    color: var(--text-support);
    padding-top: 2px;
  }
  .rail-list, .rail-grid {
    display: grid;
    gap: 2px 10px;
  }
  .rail-grid {
    grid-template-columns: 1fr auto;
  }
  .rail-grid span:nth-child(odd) {
    color: var(--text-support);
  }
  .rail-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
  }
  .rail-row > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .rail-empty {
    color: var(--text-support);
    text-align: center;
    padding: 10px 0;
    letter-spacing: 0.08em;
    font-size: var(--font-size-2xs);
  }
  .exchange {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .exchange-head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.08em;
    color: var(--text-support);
  }

  .head {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    row-gap: 3px;
    gap: 6px;
    min-width: 0;
    background: transparent;
    border: none;
    padding: 0;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-xs);
    letter-spacing: 0.12em;
    text-transform: lowercase;
    cursor: pointer;
  }
  .head.inert {
    cursor: default;
  }
  .head:not(.inert):hover .who {
    opacity: 0.75;
  }
  .fold {
    width: 10px;
    flex-shrink: 0;
    text-align: center;
    color: var(--text-support);
    font-size: var(--font-size-2xs);
  }
  .grow {
    flex: 1;
  }
  .elapsed {
    opacity: 0.45;
    letter-spacing: 0.04em;
    text-transform: none;
    padding-left: 6px;
  }
  .state.calling {
    opacity: 1;
    color: var(--colors-skeleton-0-warning-base);
  }
  .state.calling b {
    font-weight: inherit;
    color: var(--colors-skeleton-2-contrast);
    text-transform: none;
    letter-spacing: 0.04em;
    padding-left: 5px;
  }

  .activity {
    width: 92%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 2px 0 2px 4px;
    padding-left: 8px;
    border-left: 1px solid var(--colors-skeleton-2-boundary);
  }
  .rail .activity {
    width: auto;
    margin-left: 0;
    padding-left: 6px;
  }

  .call {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .call-head {
    display: flex;
    align-items: center;
    gap: 5px;
    width: 100%;
    min-width: 0;
    padding: 2px 6px;
    background: var(--colors-skeleton-0-surface);
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-xs);
    text-transform: lowercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    text-align: left;
  }
  .call-head:hover {
    border-color: var(--colors-skeleton-3-boundary);
  }
  .call.failed .call-head {
    border-color: var(--colors-skeleton-0-danger-base);
  }
  .call.running .call-head {
    border-color: var(--colors-skeleton-0-warning-base);
  }
  .call-name {
    flex-shrink: 0;
    color: var(--colors-skeleton-0-primary-base);
  }
  .call-args {
    flex-shrink: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--font-size-2xs);
    color: var(--text-support);
  }
  .chip {
    flex-shrink: 0;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.06em;
    padding: 0 4px;
    border-radius: 2px;
    border: 1px solid var(--colors-skeleton-3-boundary);
    background: transparent;
    color: var(--colors-skeleton-0-primary-base);
  }
  .call-status {
    flex-shrink: 0;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.08em;
  }
  .call-status.ok {
    color: var(--colors-skeleton-0-success-base);
  }
  .call-head.inert {
    cursor: default;
  }
  .call-status.error {
    color: var(--colors-skeleton-0-danger-base);
  }
  .beacon {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-0-warning-base);
    animation: dot-pulse 1.2s ease-in-out infinite;
  }
  .call-body {
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-top: none;
    padding: 3px 6px 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .call-output {
    margin: 0;
    padding: 0;
    max-height: 132px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    line-height: 1.45;
    max-width: 100%;
    overflow: auto;
    overscroll-behavior: contain;
    white-space: pre-wrap;
  }

  .chan {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .chan-head {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    padding: 1px 0;
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    text-align: left;
  }
  .chan-head:hover .chan-key {
    color: var(--colors-skeleton-2-contrast);
  }
  .chan-key {
    flex-shrink: 0;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.12em;
    text-transform: lowercase;
    color: var(--text-support);
  }
  .chan-sum {
    flex-shrink: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--font-size-2xs);
    color: var(--text-support);
  }
  .chan-body {
    padding-left: 15px;
    max-height: 132px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .scroll {
    max-width: 100%;
    overflow-x: auto;
    overscroll-behavior-x: contain;
  }
  .think.inline {
    margin: 2px 0 6px;
  }
  .think {
    margin-left: 8px;
    padding: 2px 0 4px 8px;
    border-left: 1px solid var(--colors-skeleton-2-boundary);
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
    line-height: 1.5;
    font-style: italic;
    color: var(--text-support);
    white-space: pre-wrap;
  }

  .rows {
    display: flex;
    flex-direction: column;
    padding-left: 15px;
  }
  .row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0 10px;
    padding: 4px 0;
    align-items: baseline;
    border-top: 1px solid var(--colors-skeleton-1-surface);
    min-width: 0;
  }
  .row > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row-term {
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-0-contrast);
  }
  .row-kind {
    justify-self: end;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.06em;
    color: var(--text-support);
  }
  .row-gloss {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-xs);
    line-height: 1.4;
    color: var(--text-body);
  }
  .row-meter {
    justify-self: end;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .bar {
    display: block;
    width: 26px;
    flex-shrink: 0;
    height: 3px;
    background: var(--colors-skeleton-2-boundary);
  }
  .bar > span {
    display: block;
    height: 100%;
    background: var(--colors-skeleton-0-primary-base);
  }
  .band {
    font-size: var(--font-size-2xs);
    letter-spacing: 0.06em;
  }
  .bar.unknown > span {
    background: var(--text-support);
  }
  .band.unknown {
    color: var(--text-support);
  }
  .bar.weak > span {
    background: var(--colors-skeleton-0-warning-base);
  }
  .band.weak {
    color: var(--colors-skeleton-0-warning-base);
  }
  .bar.strong > span {
    background: var(--colors-skeleton-0-success-base);
  }
  .band.strong {
    color: var(--colors-skeleton-0-success-base);
  }
  .band.runnable {
    color: var(--colors-skeleton-0-primary-base);
  }
  .chip.bad {
    color: var(--colors-skeleton-0-danger-base);
    border-color: var(--colors-skeleton-0-danger-base);
    opacity: 1;
  }
  .more {
    align-self: flex-start;
    margin-top: 4px;
    padding: 0;
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.08em;
    color: var(--text-support);
    cursor: pointer;
  }
  .more:hover {
    color: var(--colors-skeleton-2-contrast);
  }
  .pairs {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1px 10px;
    padding: 2px 0 4px 15px;
    font-size: var(--font-size-xs);
    min-width: 0;
  }
  .pair-key {
    color: var(--text-support);
  }
  .pair-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--colors-skeleton-0-contrast);
  }
  .launch:disabled {
    opacity: 0.3;
    cursor: default;
    border-color: var(--colors-skeleton-2-boundary);
    background: transparent;
    color: inherit;
  }
  .launch:disabled:hover {
    border-color: var(--colors-skeleton-2-boundary);
    background: transparent;
  }
  .launchers {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin: 3px 0;
  }
  .launch {
    grid-column: 1 / -1;
    justify-self: start;
    margin-top: 3px;
    padding: 2px 8px;
    border: 1px solid var(--colors-skeleton-0-primary-base);
    border-radius: 2px;
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 8%, transparent);
    color: var(--colors-skeleton-0-primary-base);
    font: inherit;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.06em;
    cursor: pointer;
  }
  .launch:hover {
    border-color: var(--colors-skeleton-0-primary-base);
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 16%, transparent);
  }
  .launchers .launch {
    grid-column: auto;
    margin-top: 0;
  }

  .artifacts {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }
  .artifact-img {
    max-width: 100%;
    max-height: 220px;
    border-radius: 3px;
    border: 1px solid var(--colors-skeleton-2-boundary);
  }
  .artifact-audio {
    max-width: 100%;
    height: 28px;
  }
  .artifact-card {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 11px;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-primary-base) 30%, transparent);
    border-radius: 6px;
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 5%, transparent);
    color: var(--colors-skeleton-0-contrast);
    text-decoration: none;
    font-size: var(--font-size-xs);
  }
  .artifact-card:hover {
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 55%, transparent);
  }
  .artifact-glyph {
    color: var(--colors-skeleton-0-primary-base);
  }

  .streaming-entry .time .dot,
  .state.thinking .dot {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--colors-skeleton-0-primary-base);
    margin: 0 1px;
    animation: dot-pulse 1.2s ease-in-out infinite;
  }
  .streaming-entry .time .dot:nth-child(2),
  .state.thinking .dot:nth-of-type(2) { animation-delay: 0.2s; }
  .streaming-entry .time .dot:nth-child(3),
  .state.thinking .dot:nth-of-type(3) { animation-delay: 0.4s; }
  @keyframes dot-pulse {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
    40% { opacity: 1; transform: scale(1); }
  }

  .placeholder {
    color: var(--text-support);
    font-size: var(--font-size-2xs);
    text-align: center;
    padding: 24px 0;
    letter-spacing: 0.08em;
  }

  .new-pill {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) scale(1.15);
    transform-origin: bottom center;
    background: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-surface);
    border: none;
    border-radius: 12px;
    padding: 4px 10px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    cursor: pointer;
    box-shadow: 0 1px 6px color-mix(in srgb, var(--colors-skeleton-0-primary-base) 50%, transparent);
    z-index: 5;
  }
  .new-pill.quiet {
    background: color-mix(in srgb, var(--colors-skeleton-2-surface) 85%, var(--colors-skeleton-0-primary-base));
    color: var(--colors-skeleton-0-primary-base);
    border: 1px solid var(--colors-skeleton-0-primary-base);
    box-shadow: 0 1px 6px color-mix(in srgb, var(--colors-skeleton-0-surface) 60%, transparent);
  }

  .error-bar {
    background: var(--colors-skeleton-2-error-surface);
    color: var(--colors-skeleton-2-error-contrast);
    padding: 4px 10px;
    border-top: 1px solid var(--colors-skeleton-2-error-boundary);
    font-size: var(--font-size-2xs);
    text-transform: lowercase;
    letter-spacing: 0.06em;
  }

  /* nothing lives behind hover on a coarse pointer, and every row stays thumbable */
  @media (pointer: coarse) {
    .head, .call-head, .chan-head, .more {
      min-height: 32px;
    }
    .actions {
      opacity: 1;
    }
    .send {
      width: 34px;
      height: 34px;
    }
  }

  .composer {
    position: relative;
    display: flex;
    gap: 6px;
    padding: 6px 7px;
    border-top: 1px solid var(--colors-skeleton-2-boundary);
    flex-shrink: 0;
    align-items: flex-end;
  }
  .input {
    flex: 1;
    padding: 5px 9px;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    background: transparent;
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    letter-spacing: 0.02em;
    transition: border-color 0.16s;
    resize: none;
    min-height: 32px;
    max-height: 112px;
    field-sizing: content;
    line-height: 20px;
    overflow-y: auto;
  }
  .input:focus {
    outline: none;
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .input:disabled {
    opacity: 0.3;
  }
  .send {
    width: 32px;
    height: 32px;
    padding: 0;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-primary-base) 45%, transparent);
    border-radius: 2px;
    color: var(--colors-skeleton-0-primary-base);
    cursor: pointer;
    transition: background 0.16s, color 0.16s, border-color 0.16s;
    flex-shrink: 0;
  }
  .send svg {
    width: 15px;
    height: 15px;
    display: block;
  }
  .send:not(.stop):not(:disabled):hover {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 16%, transparent);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .send:disabled {
    background: transparent;
    border-color: var(--colors-skeleton-2-boundary);
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.3;
    cursor: not-allowed;
  }
  .send.stop {
    background: transparent;
    border-color: var(--colors-skeleton-0-danger-base);
    color: var(--colors-skeleton-0-danger-base);
  }
  .send.stop:hover {
    background: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 18%, transparent);
  }
  .dictation-ghost {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 8px;
    right: 8px;
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 5px 8px;
    font-size: 12px;
    line-height: 17px;
    background: color-mix(in srgb, var(--colors-skeleton-0-surface) 92%, transparent);
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-danger-base) 40%, transparent);
    border-radius: 2px;
    backdrop-filter: blur(4px);
    pointer-events: none;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .dictation-ghost .mark {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-0-danger-base);
    flex-shrink: 0;
    align-self: center;
    animation: dictation-breathe 1.4s ease-in-out infinite;
  }
  .dictation-ghost .volatile {
    opacity: 0.45;
    font-style: italic;
  }
  @keyframes dictation-breathe {
    0%, 100% { opacity: 0.35; }
    50% { opacity: 1; }
  }
</style>
