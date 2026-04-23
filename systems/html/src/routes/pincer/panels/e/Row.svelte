<script>
  let { letter, name, status, statusKind = "idle", children, footer } = $props();
</script>

<section class="row">
  <header>
    <span class="letter">{letter}</span>
    <span class="name">{name}</span>
    {#if status}
      <span class="status status-{statusKind}">{status}</span>
    {/if}
  </header>
  <div class="body">
    {@render children?.()}
  </div>
  {#if footer}
    <div class="footer">
      {@render footer()}
    </div>
  {/if}
</section>

<style>
  .row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 10px;
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 60%, transparent);
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 60%, transparent);
    border-radius: 3px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    letter-spacing: 0.04em;
  }
  header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 30%, transparent);
    padding-bottom: 4px;
  }
  .letter {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
    width: 14px;
    text-align: center;
    font-size: 11px;
  }
  .name {
    flex: 1;
    text-transform: lowercase;
    letter-spacing: 0.06em;
    opacity: 0.75;
  }
  .status {
    font-size: 8px;
    text-transform: lowercase;
    padding: 1px 6px;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 8px;
    opacity: 0.7;
  }
  .status-live {
    color: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
    opacity: 1;
  }
  .status-pulling {
    color: var(--colors-skeleton-0-warning-base);
    border-color: var(--colors-skeleton-0-warning-base);
    opacity: 1;
  }
  .status-error {
    color: var(--colors-skeleton-0-danger-base);
    border-color: var(--colors-skeleton-0-danger-base);
    opacity: 1;
  }
  .status-stub {
    opacity: 0.4;
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .footer {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding-top: 4px;
  }
</style>
