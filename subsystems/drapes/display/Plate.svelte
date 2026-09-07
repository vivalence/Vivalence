<script>
  import Pip from "./Pip.svelte";

  let { mark, name, description = null, state = null, size = "md", muted = false, children } = $props();
  const marks = { sm: "26px", md: "34px", lg: "38px" };
</script>

<div class="plate" class:muted>
  <span class="plate-mark" style:width={marks[size]} style:height={marks[size]}>{mark}</span>
  <div class="plate-text">
    <span class="plate-name">{name}</span>
    {#if description}<span class="plate-description">{description}</span>{/if}
    {#if children}{@render children()}{/if}
  </div>
  {#if state}
    <span class="plate-state {state.tone ?? 'muted'}"><Pip size={6} tone={state.tone ?? "muted"} glow={state.tone === "primary"} />{state.label}</span>
  {/if}
</div>

<style>
  .plate {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    font-family: var(--font-family-code);
  }
  .plate-mark {
    display: grid;
    place-items: center;
    flex: none;
    border: 1px solid var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
    font-size: var(--font-size-sm);
    letter-spacing: 0.1em;
    font-weight: 600;
  }
  .plate.muted .plate-mark {
    border-color: color-mix(in srgb, var(--colors-skeleton-3-contrast) 40%, transparent);
    color: var(--text-body);
  }
  .plate-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
    flex: 1;
  }
  .plate-name {
    font-family: var(--font-family-sans-heading);
    font-weight: 500;
    font-size: var(--font-size-md);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .plate-description {
    font-size: var(--font-size-xs);
    color: var(--text-support);
    letter-spacing: 0.04em;
  }
  .plate-state {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: none;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-support);
  }
  .plate-state.primary {
    color: var(--colors-skeleton-0-primary-base);
  }
</style>
