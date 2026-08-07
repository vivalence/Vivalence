<script>
  // The app header — brand · phase · context line.
  const { phase, context } = $props();
</script>

<header class="chrome">
  <span class="brand">Nyan</span>
  <span class="sep">·</span>
  <span class="phase">{phase}</span>
  {#if context}<span class="ctx">{context}</span>{/if}
</header>

<style>
  .chrome {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
  }
  .brand {
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--colors-theme-primary-contrast);
  }
  .sep {
    color: var(--colors-skeleton-1-boundary);
  }
  .phase {
    color: var(--colors-skeleton-1-contrast);
  }
  .ctx {
    margin-left: auto;
    color: var(--colors-skeleton-1-boundary);
  }
</style>
