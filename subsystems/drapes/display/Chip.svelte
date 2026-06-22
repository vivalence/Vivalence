<script>
  import Pip from "./Pip.svelte";

  let {
    label,
    active = false,
    tone = "primary",
    mark = null,
    onclick,
    onmark,
    disabled = false,
    title = null,
  } = $props();
</script>

<button class="chip" class:active class:disabled {disabled} {title} onclick={onclick}>
  <Pip size={5} tone={active ? tone : "muted"} />
  <span class="chip-label">{label}</span>
  {#if mark}
    <span
      class="chip-mark"
      class:remove={mark === "×"}
      onclick={(event) => {
        event.stopPropagation();
        onmark?.();
      }}
    >{mark}</span>
  {/if}
</button>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 40%, transparent);
    border-radius: 3px;
    background: transparent;
    color: color-mix(in srgb, currentColor 55%, transparent);
    font: inherit;
    font-size: var(--font-size-sm);
    letter-spacing: 0.03em;
    cursor: pointer;
  }
  .chip.active {
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 55%, transparent);
    color: var(--colors-skeleton-0-primary-base);
  }
  .chip.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .chip-mark {
    opacity: 0.7;
    cursor: pointer;
  }
  .chip-mark:hover {
    opacity: 1;
  }
  .chip-mark.remove {
    color: var(--colors-skeleton-0-danger-base);
  }
</style>
