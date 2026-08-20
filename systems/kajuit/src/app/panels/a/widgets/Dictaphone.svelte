<script>
  let { active, level, disabled = false, fault = null, onstart, onstop } = $props();

  const busy = $derived($active === "arming" || $active === "settling");
  const listening = $derived($active === "listening");
</script>

<button
  class="dictaphone"
  class:listening
  class:busy
  onclick={() => (listening ? onstop?.() : onstart?.())}
  onpointerdown={(event) => event.preventDefault()}
  disabled={disabled || busy}
  title={fault ?? (listening ? "settle dictation" : "dictate")}
  aria-label={listening ? "stop dictation" : "start dictation"}
>
  <span class="pulse" style:transform="scale({1 + Math.min(($level ?? 0) * 6, 0.9)})"></span>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <line x1="12" y1="18" x2="12" y2="21" />
  </svg>
</button>

<style>
  .dictaphone {
    position: relative;
    width: 32px;
    height: 32px;
    padding: 0;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-primary-base) 45%, transparent);
    border-radius: 2px;
    color: var(--colors-skeleton-0-primary-base);
    cursor: pointer;
    transition: background 0.16s, color 0.16s, border-color 0.16s;
    flex-shrink: 0;
    overflow: hidden;
  }
  .dictaphone svg {
    width: 15px;
    height: 15px;
    display: block;
    position: relative;
  }
  .dictaphone:not(:disabled):hover {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 16%, transparent);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .dictaphone:disabled {
    opacity: 0.4;
    cursor: progress;
  }
  .dictaphone.listening {
    border-color: var(--colors-skeleton-0-danger-base);
    color: var(--colors-skeleton-0-danger-base);
  }
  .dictaphone.busy {
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .pulse {
    position: absolute;
    inset: 0;
    border-radius: 2px;
    background: color-mix(in srgb, currentColor 14%, transparent);
    transform-origin: center;
    transition: transform 0.08s linear;
    pointer-events: none;
  }
</style>
