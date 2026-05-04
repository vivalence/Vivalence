<script>
  import { getContext, tick } from "svelte";
  import { traits } from "@vivalence/kajuit";
  import { QUARTERS } from "$client";
  import Markdown from "./Markdown.svelte";

  let { thread } = $props();

  const quarters = getContext(QUARTERS);

  let conversationState = $state("—");
  let conversation = $state(null);
  let turns = $state([]);
  let streaming = $state(null);
  let pending = $state(false);
  let lastError = $state(null);

  let terminal = $state(null);
  let composer = $state({ enterSends: true, density: "comfortable" });

  let draft = $state("");
  let textareaEl = $state(null);
  let logEl = $state(null);
  let pinned = $state(true);
  let unread = $state(0);

  $effect(() => {
    if (!quarters?.$terminal) return;
    let composerSub = null;
    const sub = quarters.$terminal.subscribe((next) => {
      terminal = next;
      composerSub?.();
      composerSub = null;
      if (next?.$composer) {
        composer = next.composer ?? composer;
        composerSub = next.$composer.subscribe((value) => {
          composer = value ?? composer;
        });
      }
    });
    return () => {
      sub();
      composerSub?.();
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

  const live = $derived(conversationState === "LIVE");
  const isStreaming = $derived(!!streaming);
  const isThinking = $derived(pending && !streaming);

  function turnText(turn) {
    const parts = turn?.parts ?? [];
    return parts
      .filter((p) => p?.type === "text")
      .map((p) => p.text)
      .join("");
  }

  function turnTools(turn) {
    const parts = turn?.parts ?? [];
    return parts.filter((p) => p?.type === "tool_use" || p?.type === "tool_result");
  }

  function turnArtifacts(turn) {
    const parts = turn?.parts ?? [];
    return parts.filter((p) =>
      p?.type === "image" || p?.type === "audio" || p?.type === "file" || p?.type === "artifact",
    );
  }

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
    traits.thread.conversational.send(thread, parts);
    pinned = true;
    scrollToBottom(true);
  }

  function stop() {
    traits.thread.conversational.abort(thread);
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
    traits.thread.conversational.send(thread, [{ type: "text", text }]);
  }

  function regenerate() {
    const text = lastUserText();
    if (!text) return;
    traits.thread.conversational.send(thread, [{ type: "text", text }]);
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
    <span class="pip" class:live></span>
    <span class="title">{thread?.label?.name ?? "session"}</span>
    {#if isStreaming}
      <span class="state streaming">streaming</span>
    {:else if isThinking}
      <span class="state thinking">thinking…</span>
    {:else}
      <span class="state">{conversationState.toLowerCase()}</span>
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
            <span class="who">{turn.role === "user" ? "you" : (thread?.label?.name ?? "agent")}</span>
            {#if item.date}
              <span class="time" title={item.date.toLocaleString()}>{relativeTime(item.date)}</span>
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
                    {#if tool.type === "tool_use"}<span class="tool-kind">→</span>{:else}<span class="tool-kind">←</span>{/if}
                    <span class="tool-name">{tool.name ?? tool.id ?? "tool"}</span>
                  </summary>
                  <pre>{JSON.stringify(tool.input ?? tool.output ?? tool, null, 2)}</pre>
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
                  <a class="artifact-link" href={art.url ?? "#"} target="_blank" rel="noreferrer noopener">{art.name ?? art.url ?? art.type}</a>
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
    gap: 6px;
    padding: 6px 9px;
    border-bottom: 1px solid var(--colors-skeleton-2-boundary);
    flex-shrink: 0;
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: lowercase;
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
  .state {
    margin-left: auto;
    opacity: 0.4;
    font-size: 8px;
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
    font-size: 11px;
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
    font-size: 8px;
    text-transform: lowercase;
    letter-spacing: 0.12em;
  }

  .entry {
    display: flex;
    flex-direction: column;
    gap: 3px;
    align-items: stretch;
    max-width: 100%;
    position: relative;
  }
  .entry-meta {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 8px;
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
    font-size: 8px;
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
    font-size: 8px;
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
  }
  .entry.user .text {
    color: var(--colors-skeleton-0-contrast);
    padding-left: 8px;
    border-left: 1px solid color-mix(in srgb, var(--colors-skeleton-0-primary-base) 35%, transparent);
  }
  .entry.agent .text {
    color: var(--colors-skeleton-0-primary-base);
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
    font-size: 9px;
    text-transform: lowercase;
    letter-spacing: 0.08em;
  }
  .tool summary::-webkit-details-marker { display: none; }
  .tool-kind {
    color: var(--colors-skeleton-0-primary-base);
    width: 10px;
    text-align: center;
  }
  .tool-name {
    flex: 1;
    opacity: 0.8;
  }
  .tool pre {
    margin: 0;
    padding: 4px 6px 6px;
    border-top: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 25%, transparent);
    font-family: var(--font-family-code);
    font-size: 9px;
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
  .artifact-link {
    display: inline-flex;
    padding: 3px 7px;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 35%, transparent);
    border-radius: 3px;
    color: var(--colors-skeleton-0-primary-base);
    text-decoration: none;
    font-size: 9px;
  }
  .artifact-link:hover {
    border-color: var(--colors-skeleton-0-primary-base);
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
    font-size: 9px;
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
    font-size: 9px;
    cursor: pointer;
    box-shadow: 0 1px 6px color-mix(in srgb, var(--colors-skeleton-0-primary-base) 50%, transparent);
    z-index: 5;
  }

  .error-bar {
    background: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 18%, transparent);
    color: var(--colors-skeleton-0-danger-base);
    padding: 4px 10px;
    border-top: 1px solid color-mix(in srgb, var(--colors-skeleton-0-danger-base) 40%, transparent);
    font-size: 9px;
    text-transform: lowercase;
    letter-spacing: 0.06em;
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
    font-size: 11px;
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
    font-size: 11px;
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
</style>
