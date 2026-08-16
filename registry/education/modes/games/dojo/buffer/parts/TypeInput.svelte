<script>
  const {
    value,
    submitted,
    signal = null,
    placeholder,
    rep,
    onchange,
    onsubmit,
    onnext,
  } = $props();

  const TONE = {
    MASTERY: "var(--colors-theme-primary-contrast)",
    SUCCESS: "var(--colors-system-success-contrast)",
    NEUTRAL: "var(--colors-theme-secondary-contrast)",
    MISTAKE: "var(--colors-system-warning-contrast)",
    FAILURE: "var(--colors-system-error-contrast)",
  };

  let field = $state(null);

  function settle() {
    if (!field || document.activeElement === field) return;
    field.focus({ preventScroll: true });
  }

  $effect(() => {
    rep;
    settle();
  });

  const keep = (event) => event.preventDefault();

  function typing(event) {
    if (submitted) {
      event.target.value = value;
      return;
    }
    onchange(event.target.value);
  }
</script>

<input
  class="field"
  class:locked={submitted}
  style:border-color={TONE[signal]}
  bind:this={field}
  data-rep-input
  autocomplete="off"
  autocapitalize="off"
  autocorrect="off"
  spellcheck="false"
  inputmode="text"
  enterkeyhint={submitted ? "next" : "go"}
  {value}
  oninput={typing}
  {placeholder} />

{#if submitted}
  <button class="btn next" onpointerdown={keep} onclick={onnext}>Next →</button>
{:else}
  <button class="btn check" onpointerdown={keep} onclick={onsubmit}>Check</button>
{/if}

<style>
  .field {
    flex: 1;
    min-width: 0;
    min-height: 64px;
    padding: 0.75rem 1.25rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 50%, var(--colors-skeleton-0-surface));
    color: var(--text-primary);
    font-size: var(--font-size-base);
    font-family: var(--font-family-serif-heading);
    outline: none;
    box-sizing: border-box;
  }
  .field::placeholder {
    color: var(--text-support);
  }
  .field.locked {
    color: var(--text-support);
  }
  .btn {
    min-height: 64px;
    padding: 0.75rem 2.25rem;
    border-radius: 0.5rem;
    font-size: var(--font-size-md);
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .check {
    border: none;
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
  }
  .next {
    border: 1px solid var(--colors-theme-primary-contrast);
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 35%, transparent);
    color: var(--colors-theme-primary-contrast);
  }
  @media (max-width: 640px) {
    .btn {
      padding: 0.75rem 1.25rem;
    }
  }
</style>
