<script>
  import { persist } from "@vivalence/drapes";
  const {
    value,
    submitted,
    editable = false,
    passive = false,
    retain = false,
    hold = 600,
    ready = false,
    signal = null,
    placeholder,
    onchange,
    onsubmit,
    onnext,
    onready,
  } = $props();

  const TONE = {
    MASTERY: "var(--colors-theme-primary-contrast)",
    SUCCESS: "var(--colors-system-success-contrast)",
    NEUTRAL: "var(--colors-theme-secondary-contrast)",
    MISTAKE: "var(--colors-system-error-contrast)",
    FAILURE: "var(--colors-system-error-contrast)",
  };
  const MISSES = ["MISTAKE", "FAILURE"];
  const LANDINGS = ["SUCCESS", "MASTERY"];
  const missed = $derived(submitted && MISSES.includes(signal));
  const landed = $derived(submitted && LANDINGS.includes(signal));

  const keep = (event) => event.preventDefault();

  let holding = null;
  let held = false;

  function press() {
    held = false;
    clearTimeout(holding);
    holding = setTimeout(() => {
      held = true;
      onsubmit({ force: true });
    }, hold);
  }

  function release() {
    clearTimeout(holding);
    holding = null;
  }

  function check() {
    if (held) return (held = false);
    onsubmit();
  }

  function typing(event) {
    if (passive || (submitted && !editable)) {
      event.target.value = passive ? "" : value;
      return;
    }
    onchange(event.target.value);
  }
</script>

<input
  class="field"
  class:locked={submitted}
  class:passive
  class:missed
  class:landed
  style:border-color={TONE[signal]}
  use:persist={{ active: retain }}
  data-rep-input
  autocomplete="off"
  autocapitalize="off"
  autocorrect="off"
  spellcheck="false"
  writingsuggestions="false"
  inputmode="text"
  enterkeyhint={submitted ? "next" : "go"}
  {value}
  oninput={typing}
  {placeholder} />

{#if ready}
  <button class="btn check" onclick={onready}>I'm ready ⏎</button>
{:else if submitted}
  <button class="btn next" class:missed class:landed onclick={onnext}>Next →</button>
{:else if !passive}
  <button
    class="btn check"
    onpointerdown={press}
    onpointerup={release}
    onpointerleave={release}
    onpointercancel={release}
    oncontextmenu={keep}
    onclick={check}
    title="hold to commit empty — or hold ⏎">Check</button>
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
  .field.locked:not(.missed):not(.landed) {
    color: var(--text-support);
  }
  .field.passive {
    min-height: 44px;
    padding: 0.5rem 1rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    caret-color: transparent;
  }
  .check {
    -webkit-touch-callout: none;
    user-select: none;
    -webkit-user-select: none;
  }
  .field.missed {
    color: var(--colors-system-error-contrast);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--colors-system-error-contrast) 28%, transparent);
  }
  .field.landed {
    color: var(--colors-system-success-contrast);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--colors-system-success-contrast) 22%, transparent);
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
  .next.missed {
    border-color: var(--colors-system-error-contrast);
    background: var(--colors-system-error-surface);
    color: var(--colors-system-error-contrast);
  }
  .next.landed {
    border-color: var(--colors-system-success-contrast);
    background: var(--colors-system-success-surface);
    color: var(--colors-system-success-contrast);
  }
  @media (max-width: 640px) {
    .btn {
      padding: 0.75rem 1.25rem;
    }
  }
</style>
