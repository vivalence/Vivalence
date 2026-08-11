<script>
  const { kicker, title, note = null, call = null, stats = [], label, onact } = $props();
</script>

<div class="standby" class:centered={!stats.length}>
  <span class="kicker">{kicker}</span>
  <h2 class="title">{title}</h2>

  {#if note}<p class="note">{note}</p>{/if}

  {#if call}<pre class="call">{call}</pre>{/if}

  {#if stats.length}
    <div class="stats">
      {#each stats as stat (stat.key)}
        <div class="stat">
          <span class="stat-key">{stat.key}</span>
          <span class="stat-value">{stat.value}</span>
        </div>
      {/each}
    </div>
  {/if}

  <button class="act" onclick={onact}>{label}</button>
</div>

<style>
  .standby {
    width: 100%;
    max-width: 560px;
    box-sizing: border-box;
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.625rem;
    background: var(--colors-skeleton-1-surface);
    padding: 2.375rem;
    margin: auto;
  }
  .centered {
    text-align: center;
  }
  .kicker {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-support);
  }
  .title {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    font-weight: 500;
    color: var(--text-primary);
    margin: 0.875rem 0 0 0;
  }
  .note {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
    line-height: 1.6;
    color: var(--text-body);
    max-width: 38ch;
    margin: 0.625rem auto 0 auto;
  }
  .call {
    background: var(--colors-skeleton-2-surface);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.375rem;
    padding: 0.875rem;
    margin: 1.25rem 0 0 0;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--text-support);
    text-align: left;
    white-space: pre-wrap;
    overflow-x: auto;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    background: var(--colors-skeleton-1-boundary);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.375rem;
    margin-top: 1.375rem;
    overflow: hidden;
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    background: var(--colors-skeleton-2-surface);
    padding: 0.875rem 1rem;
  }
  .stat-key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-support);
  }
  .stat-value {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-xl);
    color: var(--text-primary);
  }
  .act {
    min-height: 48px;
    margin-top: 1.375rem;
    padding: 0.75rem 1.375rem;
    border-radius: 0.5rem;
    border: none;
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-md);
    font-weight: 600;
    cursor: pointer;
  }

  @media (max-width: 640px) {
    .standby {
      padding: 1.5rem;
    }
  }
</style>
