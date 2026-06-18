<script>
  import { getContext } from "svelte";
  import { Pictogram } from "@vivalence/drapes";

  const terminal = getContext("terminal");
  const daemon = terminal.$daemon;
  const mode = terminal.$mode;
  const intent = terminal.$intent;
  const phase = terminal.$phase;
  const queue = terminal.stall.$queue;
  const active = terminal.stall.$active;
  const status = terminal.stall.$status;
</script>

<div class="ml">
  <span class="ml-phase">{$phase}</span>

  {#if $daemon}
    <span class="ml-sep">›</span>
    <span class="ml-seg hi">{$daemon.slug}</span>
  {/if}
  {#if $mode}
    <span class="ml-sep">›</span>
    <span class="ml-seg">{$mode.manifest?.name ?? $mode.slug}</span>
  {/if}
  {#if $intent}
    <span class="ml-sep">›</span>
    <span class="ml-seg lo">{$intent.name ?? $intent.slug}</span>
  {/if}

  <span class="ml-spacer"></span>

  {#if $active}
    <span class="ml-dot" class:pulling={$status === "PULLING"} class:error={$status === "ERROR"}></span>
    <span class="ml-seg lo">{($queue?.length ?? 0) + 1}</span>
  {/if}
</div>

<style>
  .ml {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 14px;
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    background: var(--colors-skeleton-1-surface);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-contrast);
    user-select: none;
  }

  .ml-phase {
    color: var(--colors-theme-primary-contrast);
    text-transform: lowercase;
    letter-spacing: 0.06em;
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
    font-size: 10px;
    flex-shrink: 0;
  }

  .ml-spacer {
    flex: 1;
    min-width: 0;
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
</style>
