<script>
  let { thread } = $props();

  let phase = $state(thread?.phase ?? null);

  $effect(() => {
    phase = thread?.phase ?? null;
    if (!thread?.$buffers) return;
    return thread.$buffers.subscribe(() => {
      phase = thread.phase ?? null;
    });
  });
</script>

{#if phase}
  <span class="meter">
    <span class="meter-label">phase</span>
    <span class="meter-value">{phase}</span>
  </span>
{/if}

<style>
  .meter {
    display: inline-flex;
    flex-direction: row;
    align-items: baseline;
    gap: 5px;
    white-space: nowrap;
    color: var(--colors-skeleton-0-contrast);
  }
  .meter-label {
    opacity: 0.45;
    text-transform: lowercase;
    letter-spacing: 0.06em;
  }
  .meter-value {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  @container shoulder (max-width: 190px) {
    .meter {
      display: none;
    }
  }
</style>
