<script>
  import { goto } from "$app/navigation";
  import { Pictogram } from "@vivalence/drapes";
  import { getContext } from "svelte";
  import { dataspace } from "$client";
  import Inspector from "./Inspector.svelte";

  const terminal = getContext("terminal");
  const daemon = terminal.$daemon;
  const mode = terminal.$mode;
  const intent = terminal.$intent;
  const thread = terminal.$thread;
  const queue = terminal.stall.$queue;
  const active = terminal.stall.$active;
  const status = terminal.stall.$status;

  let panelOpen = $state(false);
  let panelTab = $state("intents");
  let threads = $state([]);
  let inspectorOpen = $state(false);

  const daemons = dataspace.daemon.$entities;

  function navigableByType(d) {
    const modes = [...d.entities.mode.$entities.get()];
    const intents = [...d.entities.intent.$entities.get()];
    const groups = {};

    for (const m of modes) {
      const modeIntents = intents.filter((i) => i.mode?.id === m.id);
      const selfevident = m.implements("SELFEVIDENT");
      if (!selfevident && modeIntents.length === 0) continue;

      const type = m.type?.toLowerCase() ?? "other";
      if (!groups[type]) groups[type] = [];
      groups[type].push({ mode: m, intents: modeIntents, selfevident });
    }

    return Object.entries(groups);
  }

  async function navMode(m) {
    try {
      const t = await m.daemon.entities.thread.create({ mode: m.id });
      goto(m.link.branch(`/${t.id}`).absolute);
    } catch (e) {
      console.error("[modeline] navMode", e);
    }
    panelOpen = false;
  }

  async function navIntent(i) {
    try {
      const t = await i.mode.daemon.entities.thread.create({
        mode: i.mode.id,
        intent: i.id,
      });
      goto(i.link.branch(`/${t.id}`).absolute);
    } catch (e) {
      console.error("[modeline] navIntent", e);
    }
    panelOpen = false;
  }

  async function loadThreads() {
    const all = [];
    for (const d of dataspace.daemon.$entities.get()) {
      try {
        const found = await d.entities.thread.find({}, { populate: ["mode", "intent"] });
        all.push(...found);
      } catch (e) {
        console.error(`[modeline] threads for ${d.slug}`, e);
      }
    }
    threads = all.slice(0, 20);
  }

  function resume(t) {
    const link = t.intent?.link ?? t.mode?.link;
    if (!link) return;
    goto(link.branch(`/${t.id}`).absolute);
    panelOpen = false;
  }

  function togglePanel() {
    panelOpen = !panelOpen;
    if (panelOpen) inspectorOpen = false;
    if (panelOpen && panelTab === "threads") loadThreads();
  }

  function switchTab(tab) {
    panelTab = tab;
    if (tab === "threads" && threads.length === 0) loadThreads();
  }
</script>

<svelte:window onclick={() => { if (panelOpen) panelOpen = false; }} />

{#if panelOpen}
  <div class="ml-backdrop" role="presentation" onclick={() => (panelOpen = false)}></div>
  <div class="ml-panel" onclick={(e) => e.stopPropagation()}>
    <div class="ml-panel-tabs">
      <button
        class="ml-panel-tab"
        onclick={() => { panelOpen = false; goto("/viva"); }}>lobby</button>
      <button
        class="ml-panel-tab"
        class:active={panelTab === "intents"}
        onclick={() => switchTab("intents")}>intents</button>
      <button
        class="ml-panel-tab"
        class:active={panelTab === "threads"}
        onclick={() => switchTab("threads")}>threads</button>
    </div>
    <div class="ml-panel-body">
      {#if panelTab === "intents"}
        {#each $daemons as d (d.slug)}
          <div class="pn-daemon">{d.manifest?.name ?? d.slug}</div>
          {#each navigableByType(d) as [type, entries]}
            <div class="pn-type">{type}</div>
            {#each entries as { mode: m, intents: mi, selfevident } (m.id)}
              <div class="pn-mode">{m.manifest?.name ?? m.slug}</div>
              {#if selfevident}
                <button class="pn-item" class:active={$mode?.id === m.id && !$intent} onclick={() => navMode(m)}>
                  <span class="pn-dot" class:active={$mode?.id === m.id && !$intent}></span>
                  {m.manifest?.name ?? m.slug}
                </button>
              {/if}
              {#each mi as i (i.id)}
                <button class="pn-item" class:active={$intent?.id === i.id} onclick={() => navIntent(i)}>
                  <span class="pn-dot" class:active={$intent?.id === i.id}></span>
                  {i.name ?? i.slug}
                </button>
              {/each}
            {/each}
          {/each}
        {/each}
      {:else if panelTab === "threads"}
        {#if threads.length === 0}
          <div class="pn-empty">no threads yet</div>
        {:else}
          {#each threads as t (t.id)}
            <button class="pn-item" class:active={$thread?.id === t.id} onclick={() => resume(t)}>
              <span class="pn-dot" class:active={$thread?.id === t.id}></span>
              <span class="pn-thread-meta">
                <span class="pn-thread-label">{t.mode?.manifest?.name ?? t.mode?.slug ?? "—"}</span>
                {#if t.intent}
                  <span class="pn-thread-sub">{t.intent?.name ?? t.intent?.slug}</span>
                {/if}
              </span>
            </button>
          {/each}
        {/if}
      {/if}
    </div>
  </div>
{/if}

<div class="ml">
  <button
    class="ml-menu"
    class:open={panelOpen}
    onclick={(e) => { e.stopPropagation(); togglePanel(); }}>
    <Pictogram src="/images/pictogram_viket/pic-vinca-viket_white.png" alt="menu" size="xl" />
  </button>

  <span class="ml-seg hi">{$daemon?.slug ?? ""}</span>
  {#if $mode}
    <span class="ml-sep">›</span>
    <span class="ml-seg">{$mode.manifest?.name ?? $mode.slug}</span>
  {/if}
  {#if $intent}
    <span class="ml-sep">›</span>
    <span class="ml-seg lo">{$intent.name ?? $intent.slug}</span>
  {/if}

  <span class="ml-spacer"></span>

  <button
    class="ml-counter"
    onclick={(e) => { e.stopPropagation(); inspectorOpen = !inspectorOpen; panelOpen = false; }}>
    <span class="ml-dot" class:pulling={$status === "PULLING"} class:error={$status === "ERROR"}></span>
    {#if $active}
      <span class="ml-seg lo">{($queue?.length ?? 0) + 1}</span>
    {/if}
  </button>
</div>

<Inspector bind:open={inspectorOpen} />

<style>
  /* ── Bar ── */
  .ml {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 52px;
    padding: 0 14px 0 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    background: var(--colors-skeleton-1-surface);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-contrast);
    user-select: none;
  }

  @media (min-width: 768px) {
    .ml {
      height: 40px;
      gap: 8px;
      font-size: var(--font-size-sm);
      padding-bottom: 0;
    }
  }

  .ml-menu {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 100%;
    flex-shrink: 0;
    background: none;
    border: none;
    border-right: 1px solid var(--colors-skeleton-1-boundary);
    cursor: pointer;
    padding: 0;
    opacity: 0.5;
    -webkit-tap-highlight-color: transparent;
  }

  @media (min-width: 768px) {
    .ml-menu {
      width: 40px;
    }
  }

  .ml-menu:hover,
  .ml-menu.open {
    opacity: 1;
    background: var(--colors-skeleton-2-surface);
  }

  .ml-seg {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ml-seg.hi {
    color: var(--colors-skeleton-1-contrast);
    font-weight: 600;
  }

  .ml-seg.lo {
    color: var(--colors-skeleton-2-contrast);
  }

  .ml-sep {
    color: var(--colors-skeleton-1-boundary);
    font-size: 12px;
    flex-shrink: 0;
  }

  .ml-spacer {
    flex: 1;
    min-width: 0;
  }

  .ml-counter {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    background: none;
    border: none;
    border-left: 1px solid var(--colors-skeleton-1-boundary);
    height: 100%;
    padding: 0 12px;
    cursor: pointer;
    font: inherit;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  .ml-counter:hover {
    background: var(--colors-skeleton-2-surface);
  }

  .ml-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-2-contrast);
    flex-shrink: 0;
  }

  .ml-dot.pulling {
    background: var(--colors-theme-primary-contrast);
    animation: pulse 1.2s ease-in-out infinite;
  }

  .ml-dot.error {
    background: var(--colors-system-error-contrast, #e55);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* ── Backdrop + Panel ── */
  .ml-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 90;
    -webkit-tap-highlight-color: transparent;
  }

  .ml-panel {
    position: fixed;
    bottom: calc(52px + env(safe-area-inset-bottom, 0px));
    left: 0;
    right: 0;
    max-height: 60vh;
    background: var(--colors-skeleton-1-surface);
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    z-index: 91;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
  }

  @media (min-width: 768px) {
    .ml-panel {
      bottom: 40px;
      max-width: 360px;
      border-radius: 8px 8px 0 0;
    }
  }

  .ml-panel-tabs {
    display: flex;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    flex-shrink: 0;
  }

  .ml-panel-tab {
    flex: 1;
    height: 40px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--colors-skeleton-2-contrast);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  @media (min-width: 768px) {
    .ml-panel-tab {
      height: 32px;
    }
  }

  .ml-panel-tab.active {
    color: var(--colors-skeleton-1-contrast);
    border-bottom-color: var(--colors-theme-primary-contrast);
  }

  .ml-panel-body {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 4px 0 8px;
    flex: 1;
  }

  /* ── Panel items ── */
  .pn-daemon {
    padding: 12px 16px 4px;
    font-size: 10px;
    font-weight: 600;
    color: var(--colors-skeleton-1-contrast);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .pn-daemon:not(:first-child) {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    margin-top: 4px;
  }

  .pn-type {
    padding: 10px 16px 4px;
    font-size: 9px;
    font-weight: 600;
    color: var(--colors-theme-primary-contrast);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    margin-top: 4px;
  }

  .pn-type:first-child {
    border-top: none;
    margin-top: 0;
  }

  .pn-mode {
    padding: 6px 16px 2px 24px;
    font-size: 9px;
    color: var(--colors-skeleton-2-contrast);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .pn-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 44px;
    padding: 8px 16px 8px 24px;
    background: none;
    border: none;
    font: inherit;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-contrast);
    cursor: pointer;
    text-align: left;
    -webkit-tap-highlight-color: transparent;
  }

  @media (min-width: 768px) {
    .pn-item {
      min-height: 32px;
      padding: 4px 16px 4px 24px;
      font-size: var(--font-size-xs);
    }
  }

  .pn-item:hover {
    background: var(--colors-skeleton-2-surface);
  }

  .pn-item.active {
    color: var(--colors-theme-primary-contrast);
  }

  .pn-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-2-contrast);
    flex-shrink: 0;
  }

  .pn-dot.active {
    background: var(--colors-theme-primary-contrast);
  }

  .pn-thread-meta {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .pn-thread-label {
    color: var(--colors-skeleton-1-contrast);
  }

  .pn-thread-sub {
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-2-contrast);
  }

  .pn-empty {
    padding: 24px 16px;
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-2-contrast);
    text-align: center;
  }
</style>
