<script>
  import { getContext, tick } from "svelte";
  import { ThreadTraits, chain } from "@vivalence/kajuit";
  import { TERMINALS, BRIDGE /*, BOX */ } from "$client";
  import Markdown from "./Markdown.svelte";
  import { turnText, turnTools, turnArtifacts } from "./turns.js";

  let { thread } = $props();

  const terminals = getContext(TERMINALS);
  const bridge = getContext(BRIDGE);
  // const box = getContext(BOX);
  // const microphone = box.device.microphone;
  // const speaker = box.device.speaker;

  // let micClaimed = $state(microphone.claimed);
  // let micPaused = $state(microphone.paused);
  // let micSpeaking = $state(microphone.speaking);
  // let spkPlaying = $state(speaker.playing);
  // microphone.$claimed.subscribe((v) => (micClaimed = v));
  // microphone.$paused.subscribe((v) => (micPaused = v));
  // microphone.$speaking.subscribe((v) => (micSpeaking = v));
  // speaker.$playing.subscribe((v) => (spkPlaying = v));

  // reactive reads via chain from the STABLE terminals root (the panel-root idiom, a.svelte:14-17):
  // survives thread switches and rebinds inner subscriptions itself, so no hand-driven teardown.
  const conversationStore = chain(terminals, "$active", "$thread", "$conversation");
  const stateStore = chain(terminals, "$active", "$thread", "$conversation", "$state");
  const turnsStore = chain(terminals, "$active", "$thread", "$turns");
  const streamingStore = chain(terminals, "$active", "$thread", "$streaming");
  const pendingStore = chain(terminals, "$active", "$thread", "$pending");
  const lastErrorStore = chain(terminals, "$active", "$thread", "$lastError");
  const terminalStore = chain(terminals, "$active");
  const composerStore = bridge.$composer;

  let conversation = $derived($conversationStore ?? null);
  let conversationState = $derived($stateStore ?? "—");
  let turns = $derived($turnsStore ?? []);
  let streaming = $derived($streamingStore ?? null);
  let pending = $derived(!!$pendingStore);
  let lastError = $derived($lastErrorStore ?? null);
  let terminal = $derived($terminalStore ?? null);
  let composer = $derived($composerStore ?? { enterSends: true, density: "comfortable" });
  // let liveTranscript = $state(null);

  let draft = $state("");
  let textareaEl = $state(null);
  let logEl = $state(null);
  let pinned = $state(true);
  let unread = $state(0);

  let audioOn = $state(false);
  const toggleAudio = () => (audioOn = !audioOn);

  /* superseded by the chain(...) reads above — the hand-rolled subscribe/teardown mirrors:
  $effect(() => {
    if (!terminals?.$active) return;
    const sub = terminals.$active.subscribe((next) => {
      terminal = next;
    });
    composer = bridge.composer;
    const composerSub = bridge.$composer.subscribe((value) => {
      composer = value ?? composer;
    });
    return () => {
      sub();
      composerSub();
    };
  });

  $effect(() => {
    if (!thread?.$conversation) {
      conversation = null;
      return;
    }
    conversation = thread.conversation;
    return thread.$conversation.subscribe((value) => (conversation = value));
  });

  let stateTeardown = null;
  $effect(() => {
    stateTeardown?.();
    stateTeardown = null;
    if (!conversation?.$state) {
      conversationState = "—";
      return;
    }
    conversationState = conversation.$state.get() ?? "—";
    stateTeardown = conversation.$state.subscribe((value) => (conversationState = value ?? "—"));
    return () => stateTeardown?.();
  });

  $effect(() => {
    if (!thread?.$turns) {
      turns = [];
      return;
    }
    turns = thread.$turns.get() ?? [];
    return thread.$turns.subscribe((value) => (turns = value ?? []));
  });

  $effect(() => {
    if (!thread?.$streaming) {
      streaming = null;
      return;
    }
    streaming = thread.$streaming.get() ?? null;
    return thread.$streaming.subscribe((value) => (streaming = value ?? null));
  });

  $effect(() => {
    if (!thread?.$pending) {
      pending = false;
      return;
    }
    pending = thread.$pending.get() ?? false;
    return thread.$pending.subscribe((value) => (pending = !!value));
  });

  $effect(() => {
    if (!thread?.$lastError) {
      lastError = null;
      return;
    }
    lastError = thread.$lastError.get() ?? null;
    return thread.$lastError.subscribe((value) => (lastError = value ?? null));
  });
  */

  /*
  $effect(() => {
    if (!thread?.$liveTranscript) {
      liveTranscript = null;
      return;
    }
    liveTranscript = thread.$liveTranscript.get() ?? null;
    return thread.$liveTranscript.subscribe((value) => (liveTranscript = value ?? null));
  });
  */

  const live = $derived(conversationState === "LIVE");
  const isStreaming = $derived(!!streaming);
  const isThinking = $derived(pending && !streaming);

  function isAtBottom(el) {
    if (!el) return true;
    const slack = 24;
    return el.scrollTop + el.clientHeight >= el.scrollHeight - slack;
  }

  function onScroll() {
    if (!logEl) return;
    pinned = isAtBottom(logEl);
    if (pinned) unread = 0;
  }

  async function scrollToBottom(force = false) {
    if (!logEl) return;
    if (!pinned && !force) return;
    await tick();
    logEl.scrollTop = logEl.scrollHeight;
  }

  let lastTurnCount = 0;
  $effect(() => {
    const len = turns.length + (streaming ? 1 : 0);
    if (len > lastTurnCount) {
      if (pinned) scrollToBottom();
      else unread += len - lastTurnCount;
      lastTurnCount = len;
    } else {
      lastTurnCount = len;
    }
  });

  let autoGrowEl = null;
  function autoGrow(el) {
    if (!el) return;
    el.style.height = "auto";
    const max = 6 * 16;
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }

  $effect(() => {
    if (textareaEl) {
      autoGrowEl = textareaEl;
      autoGrow(textareaEl);
    }
  });

  $effect(() => {
    void draft;
    if (autoGrowEl) autoGrow(autoGrowEl);
  });

  function send() {
    if (!draft.trim() || !live) return;
    const message = draft.trim();
    const parts = [{ type: "text", text: message }];
    draft = "";

    const turnRepo = thread?.daemon?.entities?.turn;
    if (turnRepo) {
      turnRepo.merge({
        id: `tmp-user-${Date.now()}`,
        role: "user",
        parts,
        meta: null,
        thread: thread.id,
        createdAt: new Date().toISOString(),
      });
    }
    ThreadTraits.conversational.send(thread, parts);
    pinned = true;
    scrollToBottom(true);
  }

  function stop() {
    ThreadTraits.conversational.abort(thread);
  }

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
    const enterSends = composer?.enterSends ?? true;
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
    } else if (event.key === "Escape" && (isStreaming || pending)) {
      event.preventDefault();
      stop();
    }
  }

  function copyTurn(turn) {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(turnText(turn)).catch(() => {});
  }

  function retryUser(turn) {
    const text = turnText(turn);
    if (!text) return;
    ThreadTraits.conversational.send(thread, [{ type: "text", text }]);
  }

  function regenerate() {
    const text = lastUserText();
    if (!text) return;
    ThreadTraits.conversational.send(thread, [{ type: "text", text }]);
  }

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

  function relativeTime(date) {
    if (!date) return "";
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 30) return "now";
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function clockTime(date) {
    if (!date) return "";
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  let timeTick = $state(0);
  $effect(() => {
    const interval = setInterval(() => (timeTick += 1), 30000);
    return () => clearInterval(interval);
  });

  const enrichedTurns = $derived(() => {
    void timeTick;
    const items = [];
    let prevDay = null;
    for (const turn of turns) {
      const text = turnText(turn);
      const tools = turnTools(turn);
      const artifacts = turnArtifacts(turn);
      if (!text && !tools.length && !artifacts.length) continue;
      const date = turnDate(turn);
      const day = dayKey(date);
      if (date && day !== prevDay) {
        items.push({ kind: "divider", id: `div-${day}`, label: dayLabel(date) });
        prevDay = day;
      }
      items.push({ kind: "turn", turn, text, tools, artifacts, date });
    }
    return items;
  });
</script>

<div class="dock">
  <header>
    <button class="dock-close" onclick={() => bridge.setDockCollapsed()} title="collapse" aria-label="collapse dock">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </button>
    <span class="pip" class:live></span>
    <span class="title">{thread?.label?.name ?? "session"}</span>
    <span class="dock-spacer"></span>
    <button class="call" class:on={audioOn} onclick={toggleAudio} title="audio call" aria-label="audio call">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16.5 21A4.5 4.5 0 0 0 21 16.5v-1.6l-4-1.4-1.6 2a11 11 0 0 1-5.9-5.9l2-1.6L10 3.5H4.5A1.5 1.5 0 0 0 3 5 16 16 0 0 0 16.5 21Z" />
      </svg>
    </button>
    {#if isStreaming}
      <span class="state streaming">streaming</span>
    {:else if isThinking}
      <span class="state thinking">thinking…</span>
    {:else}
      <span class="state" class:live>{live ? "live" : conversationState.toLowerCase()}</span>
    {/if}
  </header>

  <div class="log" bind:this={logEl} onscroll={onScroll}>
    {#each enrichedTurns() as item (item.id ?? item.turn?.id ?? Math.random())}
      {#if item.kind === "divider"}
        <div class="day-divider"><span>{item.label}</span></div>
      {:else}
        {@const turn = item.turn}
        <div class="entry" class:user={turn.role === "user"} class:agent={turn.role === "assistant"}>
          <div class="entry-meta">
            {#if turn.role === "assistant"}
              <span class="diamond">◆</span>
              <span class="who">{thread?.label?.name ?? "agent"}</span>
              {#if item.date}<span class="sep">·</span><span class="time" title={item.date.toLocaleString()}>{clockTime(item.date)}</span>{/if}
              {#if item.tools.length}<span class="tool-count">· {item.tools.length} {item.tools.length === 1 ? "tool" : "tools"}</span>{/if}
            {:else}
              {#if item.date}<span class="time" title={item.date.toLocaleString()}>{clockTime(item.date)}</span><span class="sep">·</span>{/if}
              <span class="who">you</span>
            {/if}
            <span class="actions">
              <button type="button" class="action" title="copy" onclick={() => copyTurn(turn)}>copy</button>
              {#if turn.role === "user"}
                <button type="button" class="action" title="resend" onclick={() => retryUser(turn)}>retry</button>
              {/if}
            </span>
          </div>
          {#if item.text}
            <div class="text"><Markdown text={item.text} /></div>
          {/if}
          {#if item.tools.length}
            <div class="tools">
              {#each item.tools as tool, ti (ti)}
                <details class="tool">
                  <summary>
                    <span class="tool-tri">▸</span>
                    <span class="tool-name">{tool.name}</span>
                    <span class="tool-status {tool.status}">{tool.status}</span>
                  </summary>
                  <pre>{JSON.stringify(tool.body ?? {}, null, 2)}</pre>
                </details>
              {/each}
            </div>
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

    {#if streaming}
      <div class="entry agent streaming-entry">
        <div class="entry-meta">
          <span class="diamond">◆</span>
          <span class="who">{thread?.label?.name ?? "agent"}</span>
          <span class="time"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>
        </div>
        {#if streaming.text}
          <div class="text"><Markdown text={streaming.text} /></div>
        {/if}
      </div>
    {:else if isThinking}
      <div class="entry agent thinking-entry">
        <div class="entry-meta">
          <span class="diamond">◆</span>
          <span class="who">{thread?.label?.name ?? "agent"}</span>
        </div>
        <div class="text thinking-text"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      </div>
    {/if}

    {#if !turns.length && !streaming && !isThinking}
      <div class="placeholder">{live ? "begin" : "awaiting handshake"}</div>
    {/if}
  </div>

  {#if !pinned && unread > 0}
    <button type="button" class="new-pill" onclick={() => { pinned = true; scrollToBottom(true); unread = 0; }}>
      ↓ {unread} new
    </button>
  {/if}

  <!--
  {#if liveTranscript}
    <div class="live-transcript">{liveTranscript}</div>
  {/if}
  -->


  {#if lastError}
    <div class="error-bar" title={lastError}>error: {lastError}</div>
  {/if}

  <div class="composer">
    <textarea
      bind:this={textareaEl}
      class="input"
      bind:value={draft}
      onkeydown={onKey}
      placeholder={live ? (composer?.enterSends ? "message… (shift+enter for newline)" : "message… (enter for newline, shift+enter sends)") : "—"}
      disabled={!live}
      rows="1"></textarea>
    <!--
    {#if micClaimed}
      <button
        class="send mic"
        class:on={micSpeaking && !micPaused}
        class:muted={micPaused}
        onclick={() => (micPaused ? microphone.resume() : microphone.pause())}
        title={micPaused ? "unmute" : "mute"}>
        {micPaused ? "○" : "●"}
      </button>
    {/if}
    -->

    {#if isStreaming || pending}
      <button class="send stop" onclick={stop} title="stop (esc)">■</button>
    {:else}
      <button class="send" onclick={send} disabled={!live || !draft.trim()} title="send (enter)">↵</button>
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
  }
  .dock-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    color: color-mix(in srgb, var(--colors-skeleton-2-contrast) 75%, transparent);
    /* color: white; */
    transition: color 0.16s;
  }
  .dock-close svg {
    width: 15px;
    height: 15px;
    display: block;
  }
  .dock-close:hover {
    color: var(--colors-skeleton-0-primary-base);
  }
  .pip {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--colors-skeleton-0-boundary) 60%, transparent);
    flex-shrink: 0;
    transition: background 0.16s, box-shadow 0.16s;
  }
  .pip.live {
    background: var(--colors-skeleton-0-primary-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-primary-base);
  }
  .title {
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.85;
  }
  .dock-spacer {
    flex: 1;
  }
  .call {
    display: inline-flex;
    align-items: center;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 3px;
    color: color-mix(in srgb, var(--colors-skeleton-2-contrast) 55%, transparent);
    transition: color 0.16s;
  }
  .call svg {
    width: 16px;
    height: 16px;
    display: block;
  }
  .call:hover {
    color: var(--colors-skeleton-2-contrast);
  }
  .call.on {
    color: var(--colors-skeleton-0-primary-base);
  }
  .state {
    opacity: 0.4;
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    padding-left: 6px;
  }
  .state.live {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
  }
  .state.streaming, .state.thinking {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
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
  .day-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 4px 0;
    opacity: 0.35;
  }
  .day-divider::before, .day-divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: color-mix(in srgb, var(--colors-skeleton-0-boundary) 35%, transparent);
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
    opacity: 0.4;
  }
  .entry.user .who {
    color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 70%, var(--colors-skeleton-2-contrast));
    opacity: 0.6;
  }
  .time {
    opacity: 0.3;
    font-size: var(--font-size-2xs);
  }
  .sep {
    opacity: 0.25;
  }
  .diamond {
    color: var(--colors-skeleton-0-primary-base);
    font-size: var(--font-size-2xs);
    opacity: 0.7;
  }
  .tool-count {
    opacity: 0.35;
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
    opacity: 0.5;
    padding: 0;
  }
  .action:hover {
    opacity: 1;
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
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 45%, transparent);
    border-radius: 8px;
    background: color-mix(in srgb, var(--colors-skeleton-0-contrast) 4%, transparent);
  }
  .entry.agent .text {
    color: var(--colors-skeleton-2-contrast);
    max-width: 92%;
  }

  .tools {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-top: 4px;
  }
  .tool {
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 30%, transparent);
    border-radius: 3px;
    background: color-mix(in srgb, var(--colors-skeleton-0-surface) 30%, transparent);
    padding: 0;
  }
  .tool summary {
    list-style: none;
    cursor: pointer;
    padding: 4px 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-sm);
    text-transform: lowercase;
    letter-spacing: 0.08em;
  }
  .tool summary::-webkit-details-marker { display: none; }
  .tool-tri {
    width: 10px;
    text-align: center;
    opacity: 0.5;
    transition: transform 0.12s;
  }
  .tool[open] .tool-tri {
    transform: rotate(90deg);
  }
  .tool-name {
    flex: 1;
    color: var(--colors-skeleton-0-primary-base);
    opacity: 0.9;
  }
  .tool-status {
    font-size: var(--font-size-2xs);
    letter-spacing: 0.08em;
    opacity: 0.7;
  }
  .tool-status.ok {
    color: var(--colors-skeleton-0-primary-base);
  }
  .tool-status.error {
    color: var(--colors-skeleton-0-danger-base);
  }
  .tool-status.running {
    color: var(--colors-skeleton-0-warning-base);
  }
  .tool pre {
    margin: 0;
    padding: 4px 6px 6px;
    border-top: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 25%, transparent);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    line-height: 1.4;
    overflow-x: auto;
    white-space: pre;
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
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 30%, transparent);
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
  .thinking-text .dot {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--colors-skeleton-0-primary-base);
    margin: 0 1px;
    animation: dot-pulse 1.2s ease-in-out infinite;
  }
  .streaming-entry .time .dot:nth-child(2),
  .thinking-text .dot:nth-child(2) { animation-delay: 0.2s; }
  .streaming-entry .time .dot:nth-child(3),
  .thinking-text .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dot-pulse {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
    40% { opacity: 1; transform: scale(1); }
  }

  .placeholder {
    opacity: 0.25;
    font-size: var(--font-size-2xs);
    text-align: center;
    padding: 24px 0;
    letter-spacing: 0.08em;
  }

  .new-pill {
    position: absolute;
    bottom: 64px;
    left: 50%;
    transform: translateX(-50%);
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

  .error-bar {
    background: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 18%, transparent);
    color: var(--colors-skeleton-0-danger-base);
    padding: 4px 10px;
    border-top: 1px solid color-mix(in srgb, var(--colors-skeleton-0-danger-base) 40%, transparent);
    font-size: var(--font-size-2xs);
    text-transform: lowercase;
    letter-spacing: 0.06em;
  }
  .live-transcript {
    padding: 4px 14px;
    border-top: 1px dashed color-mix(in srgb, var(--colors-skeleton-0-primary-base) 40%, transparent);
    font-size: var(--font-size-xs);
    color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 70%, var(--colors-skeleton-0-contrast));
    font-style: italic;
    opacity: 0.85;
  }

  .composer {
    display: flex;
    gap: 5px;
    padding: 6px 7px;
    border-top: 1px solid var(--colors-skeleton-2-boundary);
    flex-shrink: 0;
    align-items: flex-end;
  }
  .input {
    flex: 1;
    padding: 5px 8px;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    background: transparent;
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    letter-spacing: 0.02em;
    transition: border-color 0.16s;
    resize: none;
    min-height: 24px;
    max-height: 96px;
    line-height: 1.4;
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
    padding: 0 10px;
    height: 24px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.16s, color 0.16s, border-color 0.16s;
    flex-shrink: 0;
  }
  .send:not(:disabled):hover {
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
    opacity: 1;
  }
  .send:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }
  .send.stop {
    border-color: var(--colors-skeleton-0-danger-base);
    color: var(--colors-skeleton-0-danger-base);
    opacity: 1;
  }
  .send.stop:hover {
    background: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 18%, transparent);
  }
  .send.mic.on {
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
    opacity: 1;
  }
  .send.mic.muted {
    opacity: 0.4;
  }
</style>
