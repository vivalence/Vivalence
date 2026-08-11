<script>
  const {
    axes,
    satisfied,
    total,
    seconds = null,
    narrow = false,
    view = "play",
    consoleOpen,
    inspectorOpen,
    onpane,
  } = $props();

  const panes = $derived(
    (narrow ? ["play", "console", "inspector"] : ["console", "inspector"]).map((id) => ({
      id,
      active: narrow ? view === id : id === "console" ? consoleOpen : inspectorOpen,
    })),
  );

  const summary = $derived(
    [
      axes.gameplay,
      axes.prompt,
      Array.isArray(axes.recall) ? "recall per index" : (axes.recall ?? "recall random"),
      axes.streak ? `streak ${axes.streak}` : "single pass",
      axes.continuous ? "continuous" : null,
      axes.preview ? "preview" : null,
      axes.limit ? "limit" : null,
    ]
      .filter(Boolean)
      .join(" · "),
  );

  const percentage = $derived(total ? Math.round((satisfied / total) * 100) : 0);
  const clock = $derived(
    seconds == null ? null : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} left`,
  );
</script>

<header class="bar">
  <div class="brand">
    <span class="name">rep-o-gram</span>
    <span class="motto">one rep machine</span>
  </div>
  {#if !narrow}
    <div class="divider"></div>
    <span class="summary">{summary}</span>
  {/if}
  <div class="spacer"></div>
  {#if clock}<span class="clock">{clock}</span>{/if}
  <div class="progress">
    <span class="count">{satisfied} / {total}</span>
    {#if !narrow}
      <div class="track"><div class="fill" style:width="{percentage}%"></div></div>
    {/if}
  </div>
  <div class="toggles">
    {#each panes as pane (pane.id)}
      <button class="toggle" class:active={pane.active} onclick={() => onpane(pane.id)}>
        {pane.id}
      </button>
    {/each}
  </div>
</header>

<style>
  .bar {
    min-height: 54px;
    flex: none;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.125rem;
    row-gap: 0.5rem;
    padding: 0.625rem 1.125rem;
    background: var(--colors-skeleton-1-surface);
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    box-sizing: border-box;
  }
  .brand {
    display: flex;
    align-items: baseline;
    gap: 0.625rem;
    white-space: nowrap;
  }
  .name {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-md);
    color: var(--colors-theme-primary-contrast);
  }
  .motto {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-support);
  }
  .divider {
    width: 1px;
    height: 20px;
    background: var(--colors-skeleton-1-boundary);
  }
  .summary {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 34vw;
  }
  .spacer {
    flex: 1;
  }
  .clock {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    letter-spacing: 0.06em;
    color: var(--colors-system-warning-contrast);
    white-space: nowrap;
  }
  .progress {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .count {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--text-support);
    white-space: nowrap;
  }
  .track {
    width: 110px;
    height: 3px;
    background: var(--colors-skeleton-2-surface);
    border-radius: 2px;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: var(--colors-theme-primary-contrast);
  }
  .toggles {
    display: flex;
    gap: 0.375rem;
  }
  .toggle {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 8px 12px;
    border-radius: 3px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
  }
  .toggle.active {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-2-surface);
  }
</style>
