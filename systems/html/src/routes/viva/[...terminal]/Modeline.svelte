<script>
  import { goto } from "$app/navigation";
  import { Pictogram } from "@vivalence/drapes";
  import { getContext } from "svelte";

  const terminal = getContext("terminal");
  const mode = terminal.$mode;
  const intent = terminal.$intent;
  const queue = terminal.stall.$queue;
  const active = terminal.stall.$active;
</script>

<div class="ml">
  <button class="ml-logo" onclick={() => goto("/viva")}>
    <Pictogram
      src="/images/pictogram_viket/pic-vinca-viket_white.png"
      alt="lobby"
      size="sm" />
  </button>

  <span class="ml-seg">{$mode?.manifest?.name ?? $mode?.slug ?? ""}</span>
  {#if $intent}
    <span class="ml-sep">›</span>
    <span class="ml-seg lo">{$intent.name ?? $intent.slug}</span>
  {/if}

  <span class="ml-spacer"></span>

  {#if $active}
    <span class="ml-seg lo">{($queue?.length ?? 0) + 1}</span>
  {/if}
</div>

<style>
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

  .ml-logo {
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

  .ml-logo:hover {
    opacity: 1;
    background: var(--colors-skeleton-2-surface);
  }

  .ml-seg {
    white-space: nowrap;
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
</style>
