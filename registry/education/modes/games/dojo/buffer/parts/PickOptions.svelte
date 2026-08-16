<script>
  const { options, answer, picked, recall, onpick } = $props();

  const answered = $derived(picked !== null);
  const text = (option) => (recall === "KNOWN" ? option.known : option.learning);
</script>

<div class="options">
  {#each options as option, index (option.literal ?? option.learning)}
    {@const correct = text(option) === text(answer)}
    {@const chosen = picked === option}
    <button
      class="option"
      class:correct={answered && correct}
      class:wrong={answered && chosen && !correct}
      class:dimmed={answered && !chosen && !correct}
      ontouchstart={(event) => event.preventDefault()}
      onclick={() => onpick(option)}
      disabled={answered}>
      <span class="key">{index + 1}</span>
      <span class="text">{text(option)}</span>
    </button>
  {/each}
</div>

<style>
  .options {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4375rem;
  }
  .option {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    min-height: 56px;
    padding: 0.875rem 1.125rem;
    border-radius: 0.625rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 70%, var(--colors-skeleton-2-surface));
    color: var(--text-primary);
    cursor: pointer;
    text-align: left;
    transition: all 0.12s;
  }
  .option:hover:not(:disabled) {
    border-color: var(--text-support);
  }
  .key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--text-support);
    width: 1rem;
    flex-shrink: 0;
  }
  .text {
    font-size: var(--font-size-base);
    font-family: var(--font-family-serif-heading);
    line-height: 1.35;
  }
  .correct {
    background: color-mix(in srgb, var(--colors-system-success-surface) 80%, transparent);
    border-color: var(--colors-system-success-contrast);
    color: var(--colors-system-success-contrast);
  }
  .wrong {
    background: color-mix(in srgb, var(--colors-system-error-surface) 80%, transparent);
    border-color: var(--colors-system-error-contrast);
    color: var(--colors-system-error-contrast);
  }
  .dimmed {
    opacity: 0.35;
  }
</style>
