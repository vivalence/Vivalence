<script>
  import { entityLabel, entityGloss, symbolLabel } from "./picker.js";

  let { kind, item } = $props();

  let label = $derived(kind === "symbol" ? symbolLabel(item) : entityLabel(item));
  let gloss = $derived(kind === "symbol" ? item.slug : entityGloss(item));
</script>

<span class="entity-label">{label}</span>
{#if gloss}<span class="entity-gloss">{gloss}</span>{/if}

<style>
  .entity-label {
    color: inherit;
    white-space: nowrap;
  }
  .entity-gloss {
    flex: 1;
    min-width: 0;
    padding-left: 8px;
    overflow: hidden;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-light);
  }
</style>
