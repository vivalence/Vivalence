<script>
  import { getContext } from "svelte";
  import { LIGHTHOUSE, QUARTERS, THREAD } from "$client";
  import { shape, steer } from "@vivalence/typology";
  import { skins } from "@vivalence/drapes";
  const { Tree } = skins;
  import { compose, composeThread } from "./navigation.js";

  const lighthouseInstance = getContext(LIGHTHOUSE);
  const quartersInstance = getContext(QUARTERS);
  const threadInstance = getContext(THREAD);

  let view = $state("outside");
  let navigationPojo = $state(null);
  let threadPojo = $state(null);

  lighthouseInstance.$daemons.subscribe(async (list) => {
    if (!list.length) return;
    const vector = await compose(quartersInstance, lighthouseInstance, threadInstance);
    navigationPojo = shape.pojo(vector, steer.direct);
  });

  threadInstance.$current.subscribe((thread) => {
    if (!thread) { threadPojo = null; return; }
    const vector = composeThread(thread);
    threadPojo = shape.pojo(vector, steer.direct);
  });
</script>

<div class="panel">
  <div class="tab-bar">
    <button class="tab" class:active={view === "outside"} onclick={() => (view = "outside")}
      >outside</button>
    <button class="tab" class:active={view === "inside"} onclick={() => (view = "inside")}
      >inside</button>
  </div>

  {#if view === "outside"}
    {#if navigationPojo}
      <Tree pojo={navigationPojo} />
    {:else}
      <div class="empty">no daemons</div>
    {/if}
  {:else if threadPojo?.effects.length}
    <table class="thread-table">
      {#each threadPojo.effects as effect}
        <tr>
          <td class="thread-key">{effect.nature}</td>
          <td class="thread-val">{effect.signature.valence?.name ?? ""}</td>
          {#if effect.signature.valence?.prompt}
            <td class="thread-hint">{effect.signature.valence.prompt}</td>
          {/if}
        </tr>
      {/each}
    </table>
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
    padding: 6px 0;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: lowercase;
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
  .empty {
    padding: 12px 14px;
    opacity: 0.25;
    text-transform: lowercase;
  }
  .thread-table {
    width: 100%;
    border-collapse: collapse;
  }
  .thread-table td {
    padding: 3px 10px;
  }
  .thread-key {
    opacity: 0.4;
    white-space: nowrap;
    width: 1%;
  }
  .thread-val {
    color: var(--colors-skeleton-0-primary-base);
  }
  .thread-hint {
    opacity: 0.25;
    font-size: 9px;
  }
</style>
