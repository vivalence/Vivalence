<script>
  const { literal } = $props();

  const learning = $derived(
    typeof literal === "string" ? literal.slice(0, 8)
      : literal?.trait?.TRANSLATED?.learning ?? literal?.slug ?? "—",
  );
  const known = $derived(
    typeof literal === "string" ? ""
      : literal?.trait?.TRANSLATED?.known ?? "",
  );
</script>

<span class="ll">
  <span class="ll-learning">{learning}</span>
  {#if known}<span class="ll-known">{known}</span>{/if}
</span>

<style>
  .ll {
    display: flex;
    gap: 6px;
    align-items: baseline;
    min-width: 0;
  }

  .ll-learning {
    font-family: var(--font-family-code);
    font-size: inherit;
    color: var(--colors-skeleton-1-contrast);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ll-known {
    font-family: var(--font-family-sans-text);
    font-size: 0.85em;
    color: var(--colors-skeleton-2-contrast);
    font-style: italic;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
