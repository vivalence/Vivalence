<script>
  // The control bar — a practice hint, or the active phase's action buttons. The
  // controls list and the action table are handed down; no drift from the keymap.
  const { phase, controls, actions } = $props();
</script>

{#if phase === "practice"}
  <span class="hint">space = next word · esc = end</span>
{:else}
  {#each controls as name}
    {@const action = actions[name]}
    <button class="btn" class:primary={name === "start"} onclick={action.run}>
      <span class="k">{action.hint}</span>
      {action.label}
    </button>
  {/each}
{/if}

<style>
  .hint {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 40px;
    padding: 0.5rem 0.9rem;
    border-radius: 0.375rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-palette-gray-200);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    cursor: pointer;
  }
  .btn .k {
    padding: 0.05rem 0.35rem;
    border-radius: 0.25rem;
    background: color-mix(in srgb, var(--colors-skeleton-1-boundary) 25%, transparent);
    color: var(--colors-skeleton-1-boundary);
    font-size: var(--font-size-xs);
  }
  .btn.primary {
    border: none;
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
    font-weight: 600;
  }
  .btn.primary .k {
    background: color-mix(in srgb, var(--colors-theme-primary-contrast) 22%, transparent);
    color: var(--colors-theme-primary-contrast);
  }
</style>
