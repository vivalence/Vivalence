<script>
  import Key from "./Key.svelte";

  let { value = 0, min = 0, max = 99, onchange } = $props();

  const put = (next) => {
    const held = Math.max(min, Math.min(max, Math.round(next)));
    if (held !== value) onchange?.(held);
  };
</script>

<div class="stepper">
  <Key size="row" square label="−" title="shift · halve" disabled={value <= min} onclick={(event) => put(event.shiftKey ? value / 2 : value - 1)} />
  <span class="stepper-value">{value}</span>
  <Key size="row" square label="+" title="shift · double" disabled={value >= max} onclick={(event) => put(event.shiftKey ? value * 2 : value + 1)} />
</div>

<style>
  .stepper {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .stepper-value {
    min-width: 44px;
    text-align: center;
    font-family: var(--font-family-code);
    font-size: var(--size-type-xs);
    font-variant-numeric: tabular-nums;
    color: var(--signal-primary-ink);
  }
</style>
