<script>
  import Spinner from "./Spinner.svelte";

  let { verb, trace = null, tone = null, dashed = false, spinner = false } = $props();
</script>

<div class="empty" class:dashed>
  {#if spinner}<Spinner />{/if}
  <span class="empty-verb" class:warning={tone === "warning"} class:negative={tone === "negative"}>{verb}</span>
  {#if trace}<span class="empty-trace">{trace}</span>{/if}
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 10px;
    text-align: center;
    min-width: 0;
    overflow-wrap: anywhere;
    font-family: var(--font-family-code);
    user-select: none;
  }
  .empty.dashed {
    background: var(--surface-sunk);
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
    border-radius: var(--shape-radius-card);
  }
  .empty-verb {
    font-size: var(--size-type-2xs);
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-light);
  }
  .empty-verb.warning {
    color: var(--signal-caution-ink);
  }
  .empty-verb.negative {
    color: var(--signal-negative-ink);
  }
  .empty-trace {
    font-size: var(--size-type-2xs);
    color: var(--text-muted);
    line-height: var(--size-leading-loose);
  }
</style>
