<script>
  import { getContext } from "svelte";
  import { QUARTERS, MAIN } from "$client";

  const SIDES = ["top", "right", "bottom", "left"];
  const SIDE_LABELS = { top: "↥", right: "↦", bottom: "↧", left: "↤" };

  const quarters = getContext(QUARTERS);
  const main = getContext(MAIN);

  let terminal = $state(null);
  let dock = $state({ side: "right", share: 0.32 });

  let dockTeardown = null;

  $effect(() => {
    if (!main?.$terminal) return;
    const sub = main.$terminal.subscribe((next) => {
      terminal = next;
      dockTeardown?.();
      dockTeardown = null;
      if (next?.$dock) {
        dock = next.dock ?? { side: "right", share: 0.32 };
        dockTeardown = next.$dock.subscribe((value) => (dock = value ?? dock));
      }
    });
    return () => {
      sub();
      dockTeardown?.();
    };
  });

  function setSide(next) {
    if (!terminal?.id || !quarters?.terminals?.update) return;
    const patch = { ...(terminal.dock ?? dock), side: next };
    quarters.terminals.update(terminal.id, { dock: patch });
  }

  function setShare(value) {
    if (!terminal?.id || !quarters?.terminals?.update) return;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return;
    const clamped = Math.max(0.18, Math.min(1.0, numeric));
    const patch = { ...(terminal.dock ?? dock), share: clamped };
    quarters.terminals.update(terminal.id, { dock: patch });
  }
</script>

<div class="section-header">dock</div>

{#if !terminal}
  <div class="empty">no terminal</div>
{:else}
  <div class="kv">
    <span class="k">side</span>
    <span class="sides">
      {#each SIDES as s (s)}
        <button
          type="button"
          class="side"
          class:on={s === dock.side}
          title="dock {s}"
          onclick={() => setSide(s)}>{SIDE_LABELS[s]}</button>
      {/each}
    </span>
  </div>

  <div class="kv">
    <span class="k">size</span>
    <span class="size-row">
      <input
        class="slider"
        type="range"
        min="0.18"
        max="1.0"
        step="0.01"
        value={dock.share ?? 0.32}
        oninput={(e) => setShare(e.currentTarget.value)} />
      <span class="size-readout">{Math.round((dock.share ?? 0.32) * 100)}%</span>
    </span>
  </div>
{/if}

<style>
  .section-header {
    padding: 8px 10px 3px;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.5;
  }
  .kv {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 4px 10px;
  }
  .k {
    min-width: 40px;
    opacity: 0.5;
    font-size: 9px;
  }
  .sides {
    display: inline-flex;
    gap: 3px;
  }
  .side {
    width: 18px;
    height: 18px;
    line-height: 1;
    padding: 0;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 60%, transparent);
    border-radius: 2px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 11px;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.16s, color 0.16s, border-color 0.16s;
  }
  .side:hover {
    opacity: 0.9;
    color: var(--colors-skeleton-0-primary-base);
  }
  .side.on {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .size-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: 1;
  }
  .slider {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: color-mix(in srgb, var(--colors-skeleton-0-boundary) 60%, transparent);
    border-radius: 2px;
    cursor: pointer;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--colors-skeleton-0-primary-base);
    cursor: pointer;
  }
  .slider::-moz-range-thumb {
    width: 10px;
    height: 10px;
    border: 0;
    border-radius: 50%;
    background: var(--colors-skeleton-0-primary-base);
    cursor: pointer;
  }
  .size-readout {
    min-width: 28px;
    text-align: right;
    opacity: 0.6;
    font-size: 9px;
  }
  .empty {
    padding: 12px 14px;
    opacity: 0.25;
    text-transform: lowercase;
    font-family: var(--font-family-code);
    font-size: 10px;
  }
</style>
