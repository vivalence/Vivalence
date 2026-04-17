<script>
  import { soma } from "@vivalence/typology";

  let { thread, dock, ondock, side, terminal = null } = $props();

  let audio = $state({ mic: "idle", speaker: "silent", vad: false, inputLevel: 0 });
  $effect(() => {
    if (!terminal?.$audio) return;
    const unsub = terminal.$audio.subscribe((value) => {
      audio = value;
    });
    return unsub;
  });

  const audioActive = $derived(
    thread?.mode?.traits?.includes("VOCALIZED") && thread?.trait?.INSITU?.audio?.enabled,
  );

  const SIDES = [
    { key: "top", glyph: "▲" },
    { key: "right", glyph: "▶" },
    { key: "bottom", glyph: "▼" },
    { key: "left", glyph: "◀" },
  ];

  let draft = $state("");
  let log = $state([
    {
      who: "sys",
      text: "session opened · " + (thread?.trait?.LABELED?.name ?? thread?.name ?? "—"),
    },
  ]);

  let logEl = $state(null);

  const sessionLive = $derived(dock.session !== "ended");

  $effect(() => {
    if (log.length && logEl) logEl.scrollTop = logEl.scrollHeight;
  });

  $effect(() => {
    if (!sessionLive || !terminal?.streams?.dialogue) return;
    const queue = terminal.streams.dialogue;
    const controller = new AbortController();
    let currentTurn = null;

    (async () => {
      try {
        for await (const packet of queue.drain(controller.signal)) {
          currentTurn = soma.pour(currentTurn, packet);
          if (packet.event === "turn.close") {
            const text =
              currentTurn?.parts
                ?.filter((p) => p.type === "text")
                ?.map((p) => p.text)
                ?.join("") ?? "";
            if (text) log = [...log, { who: "agent", text }];
            currentTurn = null;
          }
        }
      } catch (error) {
        if (error?.name !== "AbortError") console.error("[Dock] drain error:", error);
      }
    })();

    return () => controller.abort();
  });

  function send() {
    if (!draft.trim() || !sessionLive) return;
    const message = draft;
    draft = "";
    log = [...log, { who: "user", text: message }];

    if (terminal?.session?.send?.dialogue?.anchor) {
      terminal.session.send.dialogue.anchor({
        thread: thread?.id,
        parts: [{ type: "text", text: message }],
      });
    } else {
      setTimeout(() => {
        log = [...log, { who: "agent", text: ack(message) }];
      }, 600);
    }
  }

  function ack(text) {
    if (/end|stop/i.test(text)) return "ending session…";
    return "received · queued on /dialogue";
  }

  function reset() {
    log = [{ who: "sys", text: "session reset" }];
  }

  function toggleSession() {
    ondock({ session: sessionLive ? "ended" : "live" });
  }
</script>

{#if dock.collapsed}
  <button
    class="rail"
    onclick={() => ondock({ collapsed: false })}
    title="expand session"
    style:writing-mode={side === "left" || side === "right" ? "vertical-rl" : "horizontal-tb"}>
    session ›
  </button>
{:else}
  <div class="dock">
    <div class="header">
      <span class="pip" class:live={sessionLive}></span>
      <span class="session-label">session</span>
      <span class="session-state">{dock.session ?? "ended"}</span>
      {#if audioActive && sessionLive}
        <span
          class="audio-strip"
          title="mic {audio.mic} · speaker {audio.speaker} · vad {audio.vad ? 'on' : 'off'}">
          <span
            class="audio-icon mic"
            class:active={audio.mic === "capturing"}
            class:vad={audio.vad}>◉</span>
          <span class="level-meter">
            <span class="level-fill" style:width="{Math.min(100, (audio.inputLevel ?? 0) * 300)}%"
            ></span>
          </span>
          <span class="audio-icon spk" class:active={audio.speaker === "playing"}>♫</span>
        </span>
      {/if}
      <div class="side-buttons">
        {#each SIDES as s}
          <button
            class="side-btn"
            class:active={side === s.key}
            onclick={() => ondock({ side: s.key })}
            title="dock {s.key}">{s.glyph}</button>
        {/each}
        <button class="collapse-btn" onclick={() => ondock({ collapsed: true })}>—</button>
      </div>
    </div>

    <div class="action-bar">
      <div class="spacer"></div>
      <button class="action-btn" onclick={reset}>reset</button>
      <button class="action-btn" class:danger={sessionLive} onclick={toggleSession}>
        {sessionLive ? "end" : "open"}
      </button>
    </div>

    <div class="log" bind:this={logEl}>
      {#each log as entry}
        <div
          class="entry"
          class:sys={entry.who === "sys"}
          class:user={entry.who === "user"}
          class:agent={entry.who === "agent"}>
          <span class="who">{entry.who}</span>{entry.text}
        </div>
      {/each}
    </div>

    <div class="composer">
      <input
        class="input"
        bind:value={draft}
        onkeydown={(e) => e.key === "Enter" && send()}
        placeholder={sessionLive ? "message…" : "session ended"}
        disabled={!sessionLive} />
      <button class="send-btn" onclick={send} disabled={!sessionLive}>↵</button>
    </div>
  </div>
{/if}

<style>
  .dock {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--colors-skeleton-2-surface);
  }

  .rail {
    width: 100%;
    height: 100%;
    background: var(--colors-skeleton-2-surface);
    border: none;
    color: var(--colors-skeleton-0-primary-base);
    font-family: var(--font-family-code);
    font-size: 10px;
    letter-spacing: 0.5px;
    cursor: pointer;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    flex-shrink: 0;
  }
  .pip {
    width: 6px;
    height: 6px;
    border-radius: 1px;
    background: var(--colors-skeleton-2-contrast);
    flex-shrink: 0;
  }
  .pip.live {
    background: var(--colors-skeleton-0-primary-base);
    animation: pip-pulse 1.4s ease-in-out infinite;
  }
  @keyframes pip-pulse {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
  .session-label {
    font-size: 10.5px;
    color: var(--colors-skeleton-0-primary-base);
    letter-spacing: 0.5px;
    font-family: var(--font-family-code);
  }
  .session-state {
    font-size: 9.5px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
  }
  .audio-strip {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 4px;
    padding: 2px 6px;
    background: var(--colors-skeleton-1-surface);
    border-radius: 2px;
  }
  .audio-icon {
    font-size: 8px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    opacity: 0.4;
  }
  .audio-icon.active {
    color: var(--colors-skeleton-0-primary-base);
    opacity: 1;
  }
  .audio-icon.mic.vad {
    color: var(--colors-skeleton-0-primary-base);
    text-shadow: 0 0 3px currentColor;
  }
  .level-meter {
    width: 28px;
    height: 4px;
    background: var(--colors-skeleton-2-boundary);
    border-radius: 1px;
    overflow: hidden;
    position: relative;
  }
  .level-fill {
    display: block;
    height: 100%;
    background: var(--colors-skeleton-0-primary-base);
    transition: width 80ms linear;
  }
  .side-buttons {
    margin-left: auto;
    display: flex;
    gap: 3px;
    align-items: center;
  }
  .side-btn {
    width: 14px;
    height: 14px;
    padding: 0;
    border: 1px solid var(--colors-skeleton-1-boundary);
    color: var(--colors-skeleton-2-contrast);
    background: transparent;
    border-radius: 1px;
    font-size: 8px;
    line-height: 12px;
    cursor: pointer;
    font-family: var(--font-family-code);
  }
  .side-btn.active {
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .collapse-btn {
    background: none;
    border: none;
    color: var(--colors-skeleton-1-contrast);
    font-size: 11px;
    padding: 0 4px;
    line-height: 1;
    cursor: pointer;
    font-family: var(--font-family-code);
  }

  .action-bar {
    display: flex;
    gap: 4px;
    padding: 5px 8px;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    align-items: center;
    flex-shrink: 0;
  }
  .spacer {
    flex: 1;
  }
  .action-btn {
    color: var(--colors-skeleton-1-contrast);
    font-size: 9.5px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 2px;
    padding: 1px 5px;
    background: transparent;
    cursor: pointer;
    font-family: var(--font-family-code);
  }
  .action-btn.danger {
    color: var(--colors-skeleton-0-danger-base);
    border-color: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 60%, transparent);
  }

  .log {
    flex: 1;
    overflow-y: auto;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 0;
  }
  .entry {
    font-size: 11.5px;
    line-height: 1.5;
    color: var(--colors-skeleton-1-contrast);
  }
  .entry.user {
    color: var(--colors-skeleton-0-contrast);
  }
  .entry.agent {
    color: var(--colors-skeleton-0-primary-base);
  }
  .entry.sys {
    color: var(--colors-skeleton-2-contrast);
  }
  .who {
    font-family: var(--font-family-code);
    font-size: 9.5px;
    letter-spacing: 0.5px;
    color: var(--colors-skeleton-2-contrast);
    margin-right: 6px;
  }

  .composer {
    display: flex;
    gap: 4px;
    padding: 6px;
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    flex-shrink: 0;
  }
  .input {
    flex: 1;
    padding: 5px 8px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 2px;
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-contrast);
    font-size: 11px;
    font-family: var(--font-family-code);
  }
  .input:disabled {
    opacity: 0.4;
  }
  .send-btn {
    padding: 0 10px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    color: var(--colors-skeleton-1-contrast);
    background: transparent;
    border-radius: 2px;
    font-size: 11px;
    cursor: pointer;
    font-family: var(--font-family-code);
  }
  .send-btn:not(:disabled) {
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .send-btn:disabled {
    opacity: 0.3;
  }
</style>
