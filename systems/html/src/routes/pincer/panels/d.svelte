<script>
  import { getContext } from "svelte";
  import { LIGHTHOUSE, THREAD, BRIDGE } from "$client";
  import { skins } from "@vivalence/drapes";
  const { Filter, List } = skins;
  import { compose, narrow } from "./navigation.js";

  const lighthouseInstance = getContext(LIGHTHOUSE);
  const threadInstance = getContext(THREAD);
  const bridge = getContext(BRIDGE);

  let view = $state(bridge.view.d);
  let showThreads = $state(bridge.view["d.threads"]);
  let showIntents = $state(bridge.view["d.intents"]);
  let showModes = $state(bridge.view["d.modes"]);
  let threads = $state([]);
  let modes = $state([]);
  let intents = $state([]);
  let query = $state("");
  let error = $state(null);

  lighthouseInstance.$daemons.subscribe(async (list) => {
    if (!list.length) return;
    try {
      const result = await compose(lighthouseInstance, threadInstance);
      threads = result.threads;
      modes = result.modes;
      intents = result.intents;
      error = null;
    } catch (reason) {
      error = reason;
      console.error("[d.svelte] compose failed:", reason);
    }
  });

  const filteredThreads = $derived(narrow.narrow(query, threads, narrow.navigation));
  const filteredModes = $derived(narrow.narrow(query, modes, narrow.navigation));
  const filteredIntents = $derived(narrow.narrow(query, intents, narrow.navigation));
  const hasResults = $derived(
    filteredThreads.length + filteredModes.length + filteredIntents.length > 0,
  );

  let thread = $state(threadInstance.$current.get());

  threadInstance.$current.subscribe((value) => {
    thread = value;
  });
</script>

<div class="panel">
  <div class="tab-bar">
    <button class="tab" class:active={view === "outside"} onclick={() => { view = "outside"; bridge.view.d = "outside"; bridge.save(); }}
      >outside</button>
    <button class="tab" class:active={view === "inside"} onclick={() => { view = "inside"; bridge.view.d = "inside"; bridge.save(); }}
      >inside</button>
  </div>

  {#if view === "outside"}
    <div class="filter-bar">
      <Filter bind:query placeholder="navigate..." />
    </div>

    <div class="sections">
      {#if error}
        <div class="error">{error.message}</div>
      {/if}

      {#if filteredThreads.length}
        <div class="section">
          <button
            class="section-header section-toggle"
            class:section-collapsed={!showThreads}
            onclick={() => { showThreads = !showThreads; bridge.view["d.threads"] = showThreads; bridge.save(); }}
            >threads</button>
          {#if showThreads}
            <List nodes={filteredThreads} />
          {/if}
        </div>
      {/if}

      {#if filteredIntents.length}
        <div class="section">
          <button
            class="section-header section-toggle"
            class:section-collapsed={!showIntents}
            onclick={() => { showIntents = !showIntents; bridge.view["d.intents"] = showIntents; bridge.save(); }}
            >intents</button>
          {#if showIntents}
            <List nodes={filteredIntents} />
          {/if}
        </div>
      {/if}

      {#if filteredModes.length}
        <div class="section">
          <button
            class="section-header section-toggle"
            class:section-collapsed={!showModes}
            onclick={() => { showModes = !showModes; bridge.view["d.modes"] = showModes; bridge.save(); }}
            >modes</button>
          {#if showModes}
            <List nodes={filteredModes} />
          {/if}
        </div>
      {/if}

      {#if !hasResults && query}
        <div class="empty">no matches</div>
      {:else if !hasResults && !error}
        <div class="empty">no daemons</div>
      {/if}
    </div>
  {:else if view === "inside" && thread}
    <div class="inside">
      <div class="section-header">traits</div>
      {#if thread.traits?.length}
        <div class="trait-list">
          {#each thread.traits as trait}
            <span class="trait-tag">{trait}</span>
          {/each}
        </div>
      {:else}
        <div class="empty">none</div>
      {/if}

      {#if thread.trait}
        {#each Object.entries(thread.trait) as [key, value]}
          <div class="trait-block">
            <div class="trait-key">{key}</div>
            <pre class="trait-value">{JSON.stringify(value, null, 2)}</pre>
          </div>
        {/each}
      {/if}

      <div class="section-header">counters</div>
      <div class="counter-row">
        <span class="counter-key">counter</span>
        <span class="counter-value">{thread.counter}</span>
        <span class="counter-key">cursor</span>
        <span class="counter-value">{thread.cursor}</span>
      </div>
    </div>
  {:else}
    <div class="empty">no active thread</div>
  {/if}
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    letter-spacing: 0.04em;
    display: flex;
    flex-direction: column;
  }
  .tab-bar {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--colors-skeleton-2-boundary);
    flex-shrink: 0;
  }
  .tab {
    flex: 1;
    padding: 5px 0;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 9px;
    text-transform: lowercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    opacity: 0.4;
  }
  .tab:hover {
    opacity: 0.7;
  }
  .tab.active {
    opacity: 1;
    border-bottom-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .filter-bar {
    padding: 8px 8px 4px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--colors-skeleton-2-boundary);
  }
  .sections {
    flex: 1;
    overflow-y: auto;
    padding: 0 0 8px;
  }
  .section-header {
    padding: 8px 10px 3px;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.5;
  }
  .section-toggle {
    display: block;
    width: 100%;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .section-toggle::before {
    content: "▾ ";
    opacity: 0.5;
  }
  .section-toggle.section-collapsed::before {
    content: "▸ ";
  }
  .section-toggle:hover {
    opacity: 0.9;
  }
  .empty {
    padding: 12px 14px;
    opacity: 0.25;
    text-transform: lowercase;
  }
  .error {
    padding: 8px 10px;
    color: var(--colors-skeleton-0-danger-base, #f44);
    font-size: 9px;
  }
  .inside {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0 8px;
  }
  .trait-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 2px 10px 8px;
  }
  .trait-tag {
    padding: 1px 5px;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    font-size: 8px;
    letter-spacing: 0.06em;
    opacity: 0.6;
  }
  .trait-block {
    padding: 2px 10px;
  }
  .trait-key {
    font-size: 9px;
    color: var(--colors-skeleton-0-primary-base);
    opacity: 0.6;
    padding: 4px 0 1px;
  }
  .trait-value {
    margin: 0;
    font-size: 9px;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.5;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .counter-row {
    display: flex;
    gap: 8px;
    align-items: baseline;
    padding: 2px 10px 8px;
    font-size: 9px;
  }
  .counter-key {
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.4;
  }
  .counter-value {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
  }
</style>
