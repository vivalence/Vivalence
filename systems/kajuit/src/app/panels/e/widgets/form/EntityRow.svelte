<script>
  import { entityLabel, entityGloss, symbolLabel } from "./picker.js";

  let { kind, item } = $props();

  let label = $derived(kind === "symbol" ? symbolLabel(item) : entityLabel(item));
  let gloss = $derived(kind === "symbol" ? item.slug : entityGloss(item));
</script>

<span class="label">{label}</span>
{#if gloss}<span class="gloss">{gloss}</span>{/if}

<style>
  .label {
    color: inherit;
    white-space: nowrap;
  }
  .gloss {
    margin-left: auto;
    padding-left: 8px;
    opacity: 0.5;
    font-size: var(--font-size-2xs);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
