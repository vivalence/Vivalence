<script>
  import { getContext } from "svelte";
  import { QUARTERS, THREAD } from "$client";

  let { rect } = $props();
  const quarters = getContext(QUARTERS);
  const thread = getContext(THREAD);

  let terminals = $state([...quarters.terminals.all()]);
  let terminal = $state(quarters.terminal);
  let currentThread = $state(thread.current);
  let tick = $state(0);

  quarters.terminals.$entities.subscribe((entities) => {
    terminals = [...entities.values()];
  });
  quarters.$terminal.subscribe((value) => (terminal = value));
  thread.$current.subscribe((value) => (currentThread = value));

  $effect(() => {
    const interval = setInterval(() => (tick += 1), 500);
    return () => clearInterval(interval);
  });

  function tabLabel(t) {
    if (t.id === terminal?.id && currentThread?.label?.name) return currentThread.label.name;
    if (typeof t.thread === "string") return t.thread;
    return t.thread?.label?.name ?? t.thread?.id ?? "+";
  }

  function tabDescription(t) {
    if (t.id === terminal?.id && currentThread?.label?.description) return currentThread.label.description;
    if (typeof t.thread === "string") return t.slug;
    return t.thread?.label?.description ?? t.slug;
  }

  function tabFlags(t) {
    if (t.id === terminal?.id && currentThread?.label?.flags?.length) return currentThread.label.flags;
    if (t.thread?.label?.flags?.length) return t.thread.label.flags;
    return null;
  }

  function tabConversation(t) {
    void tick;
    const th = t.thread;
    if (!th || typeof th === "string") return null;
    const engaged = th.traits?.includes?.("CONVERSATIONAL") ?? false;
    if (!engaged) return null;
    return th.conversation?.$state?.get?.() ?? "IDLE";
  }
</script>

<div
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px">
  <div class="population">
    <div class="tabs">
      <button class="tab add" onclick={() => quarters.spawn()} title="new terminal">+</button>
      {#each terminals as t (t.id)}
        {@const conversationState = tabConversation(t)}
        {@const flags = tabFlags(t)}
        <button
          class="tab"
          class:active={t.id === terminal?.id}
          class:engaged={!!conversationState}
          class:live={conversationState === "LIVE"}
          class:opening={conversationState === "OPENING"}
          title={conversationState
            ? `${tabDescription(t) ?? ""} · ${conversationState.toLowerCase()}`
            : tabDescription(t)}
          onclick={() => quarters.activate(t.id)}>
          {#if conversationState}
            <span class="tab-pip"></span>
          {/if}
          <span class="tab-title" dir="rtl">
            {#if flags}
              <span class="tab-flags">{flags.join(" ")}</span>
            {/if}
            {tabLabel(t)}
          </span>
          {#if t.id === terminal?.id}
            <button
              class="tab-close"
              onclick={(e) => {
                e.stopPropagation();
                quarters.close(t.id);
              }}>×</button>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .bone {
    position: fixed;
    background: var(--colors-skeleton-1-surface);
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    pointer-events: none;
    z-index: 50;
    overflow: hidden;
  }
  .population {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    padding: 0 14px;
    justify-content: flex-end;
    pointer-events: none;
    overflow: hidden;
  }
  .population > * {
    pointer-events: auto;
  }
  .tabs {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0 2px;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tab {
    flex: 0 0 auto;
    max-width: 120px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px;
    background: color-mix(in srgb, var(--colors-skeleton-0-surface) 30%, transparent);
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 50%, transparent);
    border-radius: 3px;
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    font-size: 9px;
    letter-spacing: 0.04em;
    text-transform: lowercase;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.16s, background 0.16s, border-color 0.16s, color 0.16s;
  }
  .tab:hover {
    opacity: 0.92;
    background: color-mix(in srgb, var(--colors-skeleton-0-surface) 70%, transparent);
    border-color: color-mix(in srgb, var(--colors-skeleton-0-boundary) 90%, transparent);
  }
  .tab.active {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 8%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--colors-skeleton-0-primary-base) 12%, transparent);
  }
  .tab.engaged {
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 45%, transparent);
    color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 85%, var(--colors-skeleton-1-contrast));
  }
  .tab.engaged.active {
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .tab.add {
    opacity: 0.4;
    font-size: 13px;
    font-weight: 600;
    min-width: 22px;
    max-width: 22px;
    justify-content: center;
    padding: 0;
    line-height: 0;
  }
  .tab.add:hover {
    opacity: 0.85;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .tab-pip {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 55%, transparent);
    flex-shrink: 0;
    transition: background 0.16s, box-shadow 0.16s;
  }
  .tab.live .tab-pip {
    background: var(--colors-skeleton-0-primary-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-primary-base);
  }
  .tab.opening .tab-pip {
    background: var(--colors-skeleton-0-warning-base);
    animation: tab-pip-pulse 0.8s ease-in-out infinite;
  }
  @keyframes tab-pip-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
  .tab-close {
    flex: 0 0 auto;
    background: none;
    border: none;
    color: inherit;
    font-size: 11px;
    line-height: 1;
    padding: 0 0 0 3px;
    cursor: pointer;
    opacity: 0.45;
  }
  .tab-close:hover {
    opacity: 1;
    color: var(--colors-skeleton-0-danger-base, red);
  }
  .tab-title {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    direction: rtl;
    text-align: right;
    flex: 1;
  }
  .tab-title::before {
    content: "\200E";
  }
  .tab-flags {
    margin-right: 3px;
    opacity: 0.6;
  }
</style>
