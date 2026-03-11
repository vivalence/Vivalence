<script>
  import { getContext } from "svelte";
  import { Pictogram } from "@vivalence/drapes";
  import Navtree from "./Navtree.svelte";

  const terminal = getContext("terminal");

  const daemon = terminal.$daemon;
  const mode = terminal.$mode;
  const valence = terminal.$valence;
  const session = terminal.$session;
  const phase = terminal.$phase;
  const queue = terminal.stall.$queue;
  const status = terminal.stall.$status;
  const active = terminal.stall.$active;

  let treeOpen = $state(false);
</script>

<svelte:window onclick={() => (treeOpen = false)} />

<div class="ml-wrap">
  {#if treeOpen}
    <Navtree onnavigate={() => (treeOpen = false)} />
  {/if}

  <div class="ml">
    <button
      class="ml-viket"
      class:open={treeOpen}
      onclick={(e) => { e.stopPropagation(); treeOpen = !treeOpen; }}>
      <Pictogram
        src="/images/pictogram_viket/pic-vinca-viket_white.png"
        alt="<<"
        size="sm" />
    </button>

    <span class="ml-seg hi">{$daemon?.slug ?? "—"}</span>
    <span class="ml-sep">›</span>
    <span class="ml-seg">{$mode?.slug ?? "—"}</span>
    <span class="ml-sep">›</span>
    <span class="ml-seg">{$valence?.slug ?? "—"}</span>

    <span class="ml-spacer"></span>

    <span class="ml-dot" class:pulling={$status === "PULLING"} class:error={$status === "ERROR"}></span>
    <span class="ml-seg lo">{$status}</span>
    <span class="ml-seg lo">{$phase}</span>
    <span class="ml-seg lo">#{$queue.length}</span>

    <span class="ml-sep">│</span>
    <span class="ml-seg lo">{$active?.id?.slice(0, 8) ?? "—"}</span>
    <span class="ml-sep">│</span>
    <span class="ml-seg">{$session?.id?.slice(0, 8) ?? "—"}</span>
  </div>
</div>

<style>
  .ml-wrap {
    position: relative;
  }

  .ml {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 10px 0 0;
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    background: var(--colors-skeleton-1-surface);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-contrast);
    user-select: none;
  }

  .ml-viket {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 100%;
    flex-shrink: 0;
    background: none;
    border: none;
    border-right: 1px solid var(--colors-skeleton-1-boundary);
    cursor: pointer;
    padding: 0;
    opacity: 0.4;
  }

  .ml-viket:hover,
  .ml-viket.open {
    opacity: 1;
    background: var(--colors-skeleton-2-surface);
  }

  .ml-seg {
    white-space: nowrap;
  }

  .ml-seg.hi {
    color: var(--colors-skeleton-1-contrast);
  }

  .ml-seg.lo {
    color: var(--colors-skeleton-2-contrast);
  }

  .ml-sep {
    color: var(--colors-skeleton-1-boundary);
    font-size: 10px;
  }

  .ml-spacer {
    flex: 1;
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
  }

  .ml-dot.error {
    background: var(--colors-system-error-contrast);
  }
</style>
