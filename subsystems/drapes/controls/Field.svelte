<script>
  import Pip from "../display/Pip.svelte";

  let { label = null, width = 42, pip = false, pipTone = "primary", trailing, children } = $props();
</script>

<div class="field">
  {#if label}<span class="field-label" style:--field-label-width="{width}px">{label}</span>{/if}
  <span class="field-control">{@render children?.()}</span>
  {#if pip}<Pip size={7} tone={pipTone} pulse />{/if}
  {#if trailing}<span class="field-trailing">{@render trailing()}</span>{/if}
</div>

<style>
  .field {
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .field-label {
    width: var(--field-label-width);
    flex: none;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-light);
  }
  .field-control {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
  }
  .field-trailing {
    flex: none;
    display: inline-flex;
    align-items: center;
  }
</style>
