<script>
  let {
    user,
    assistant,
    variant = "flat",
    placeholder = "ask the oracle",
    disabled = false,
    onsubmit,
  } = $props();

  let focused = $state(false);

  function submit() {
    const text = $user?.trim();
    if (!text || disabled) return;
    onsubmit?.(text);
  }
</script>

<div class="helpdesk" data-variant={variant}>
  {#if $assistant}
    <div class="bubble">{$assistant}</div>
  {/if}
  <form
    class="entry"
    class:focused
    onsubmit={(event) => {
      event.preventDefault();
      submit();
    }}>
    <textarea
      class="input"
      rows="1"
      {placeholder}
      {disabled}
      value={$user}
      oninput={(event) => user.set(event.target.value)}
      onfocus={() => (focused = true)}
      onblur={() => (focused = false)}
      onkeydown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          submit();
        }
      }}></textarea>
  </form>
</div>

<style>
  .helpdesk {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-family: var(--font-family-code);
    color: var(--colors-skeleton-3-contrast);
  }
  .bubble {
    align-self: flex-start;
    max-width: 90%;
    padding: 10px 14px;
    border-radius: 12px 12px 12px 2px;
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 14%, transparent);
    color: var(--colors-skeleton-3-contrast);
    font-size: var(--font-size-sm);
    line-height: 1.5;
  }
  .entry {
    display: flex;
  }
  .input {
    flex: 1;
    resize: none;
    padding: 8px 12px;
    font: inherit;
    font-size: var(--font-size-sm);
    color: inherit;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 40%, transparent);
    border-radius: 6px;
  }
  .entry.focused .input {
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 55%, transparent);
  }
  .input::placeholder {
    color: color-mix(in srgb, currentColor 35%, transparent);
  }
  .input:disabled {
    opacity: 0.5;
  }
</style>
