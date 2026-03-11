<script>
  import { Paragraph } from "@vivalence/drapes";
  let { label = "", children, class: cls = "" } = $props();
</script>

<div>
  {#if label}<Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">{label}</Paragraph>{/if}
  <div class="p-4 bg-skeleton-2-surface rounded {cls}">
    {@render children()}
  </div>
</div>
