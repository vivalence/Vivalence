<script>
  import { chain } from "@vivalence/kajuit";

  let { terminal, isActive, onactivate, onclose } = $props();

  const label = chain(terminal, "$thread", "$label");
</script>

  <!-- also render indicator of conversation and its current activity -->
  <!-- also render indicator of stall and its current activity -->
  <!-- render number of buffers -->
<div class="tab" class:active={isActive} onclick={onactivate}>
  <span class="tab-title">{$label?.name ?? " [empty] "}</span>
  <button
    class="tab-close"
    onclick={(e) => {
      e.stopPropagation();
      onclose();
    }}>×</button>
</div>

<style>
  .tab {
    flex: 0 0 auto;
    max-width: 140px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 11px;
    background: color-mix(in srgb, var(--colors-skeleton-0-surface) 30%, transparent);
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 50%, transparent);
    border-radius: 3px;
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    line-height: 1;
    /* letter-spacing: 0.03em; */
    /* text-transform: lowercase; */
    cursor: pointer;
    opacity: 0.6;
    transition:
      opacity 0.16s,
      background 0.16s,
      border-color 0.16s,
      color 0.16s;
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
  .tab-pip {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 55%, transparent);
    flex-shrink: 0;
    transition:
      background 0.16s,
      box-shadow 0.16s;
  }
  @keyframes tab-pip-pulse {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
  .tab-close {
    flex: 0 0 auto;
    background: none;
    border: none;
    color: inherit;
    font-size: var(--font-size-md);
    line-height: 1;
    padding: 2 0 0 3px;
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
    /* direction: rtl; */
    /* text-align: right; */
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
