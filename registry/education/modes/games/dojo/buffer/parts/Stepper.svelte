<script>
  import { visible } from "@vivalence/drapes";

  const {
    value = 0,
    min = 0,
    max = 999,
    step = 1,
    leap = 10,
    zero = "off",
    lit = false,
    title = null,
    onchange,
  } = $props();

  const clamp = (next) => Math.max(min, Math.min(max, next));

  const shown = $derived(value ? String(value) : zero);

  function nudge(direction, event) {
    const size = event?.shiftKey ? leap : step;
    onchange(clamp((value ?? 0) + direction * size));
  }

  function typed(event) {
    const digits = String(event.target.value).replace(/[^0-9]/g, "");
    const parsed = digits ? parseInt(digits, 10) : 0;
    onchange(clamp(parsed));
    event.target.value = parsed ? String(clamp(parsed)) : zero;
  }
</script>

<span class="stepper" class:lit {title}>
  <button onclick={(event) => nudge(-1, event)} onpointerdown={(event) => event.preventDefault()}>−</button>
  <input
    value={shown}
    autocomplete="off"
    autocapitalize="off"
    autocorrect="off"
    spellcheck="false"
    writingsuggestions="false"
    use:visible={{ block: "center" }}
    onfocus={(event) => event.target.select()}
    onchange={typed}
    onkeydown={(event) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        nudge(1, event);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        nudge(-1, event);
      }
      if (event.key === "Enter") event.target.blur();
    }} />
  <button onclick={(event) => nudge(1, event)} onpointerdown={(event) => event.preventDefault()}>+</button>
</span>

<style>
  .stepper {
    display: inline-flex;
    flex: none;
    overflow-anchor: none;
    align-items: stretch;
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.2rem;
    overflow: hidden;
    height: 1.75rem;
  }
  .stepper.lit {
    border-color: var(--colors-theme-primary-contrast);
  }
  button {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    padding: 0 0.6rem;
    border: none;
    background: var(--colors-skeleton-2-surface);
    color: var(--text-support);
    cursor: pointer;
    line-height: 1;
  }
  button:hover {
    color: var(--colors-theme-primary-contrast);
  }
  input {
    width: 2.9rem;
    font-variant-numeric: tabular-nums;
    text-align: center;
    background: var(--colors-skeleton-0-surface);
    border: none;
    border-left: 1px solid var(--colors-skeleton-1-boundary);
    border-right: 1px solid var(--colors-skeleton-1-boundary);
    color: var(--text-support);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    padding: 0;
    outline: none;
    min-width: 0;
  }
  .lit input {
    color: var(--colors-theme-primary-contrast);
  }
</style>
