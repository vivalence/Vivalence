<script>
  import { getContext } from "svelte";
  import { THREAD, QUARTERS, BRIDGE } from "$client";

  const thread = getContext(THREAD);
  const quarters = getContext(QUARTERS);
  const { view, toggle } = getContext(BRIDGE);

  let show = $state(view.$inspectThread.get());
  view.$inspectThread.subscribe(v => show = v);

  let current = $state(thread.$current.get());
  let terminal = $state(quarters.$terminal.get());

  thread.$current.subscribe(v => current = v);
  quarters.$terminal.subscribe(v => terminal = v);

  function describeMarker(marker) {
    if (marker == null) return "—";
    if (typeof marker === "string") return marker;
    try { return JSON.stringify(marker).slice(0, 48); } catch { return String(marker); }
  }
</script>

{#if show}
  <div class="overlay">
    <div class="modeline">
      <span class="seg hi">T</span>
      <span class="sep">›</span>
      <span class="seg lo">thread</span>
      <span class="spacer"></span>
      <button class="btn close" onclick={() => toggle("inspectThread")}>×</button>
    </div>
    <div class="body">
      <div class="row">
        <span class="k">$current</span>
        <span class="v">{current ? "set" : "—"}</span>
      </div>
      {#if current}
        <div class="row indent">
          <span class="k">daemon</span>
          <span class="v mono">{describeMarker(current.daemon)}</span>
        </div>
        <div class="row indent">
          <span class="k">id</span>
          <span class="v mono">{current.id ?? "—"}</span>
        </div>
        <div class="row indent">
          <span class="k">mode</span>
          <span class="v mono">{describeMarker(current.mode)}</span>
        </div>
        <div class="row actions">
          <span class="k">actions</span>
          <span class="v">
            <button class="btn mini danger" onclick={() => thread.clear()}>clear</button>
          </span>
        </div>
      {/if}
      <div class="group-label">terminal markers</div>
      {#if terminal}
        <div class="row indent">
          <span class="k">terminal.id</span>
          <span class="v mono">{terminal.id ?? "—"}</span>
        </div>
        <div class="row indent">
          <span class="k">daemon marker</span>
          <span class="v mono">{describeMarker(terminal.daemon ?? terminal.markers?.daemon)}</span>
        </div>
        <div class="row indent">
          <span class="k">thread marker</span>
          <span class="v mono">{describeMarker(terminal.thread ?? terminal.markers?.thread)}</span>
        </div>
      {:else}
        <div class="row indent">
          <span class="k">—</span>
          <span class="v">no active terminal</span>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 58px;
    left: calc(75vw + 4px);
    width: calc(25vw - 12px);
    max-width: 320px;
    max-height: calc(100vh - 74px);
    background: var(--colors-skeleton-1-surface);
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    z-index: 79;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--colors-skeleton-0-accent-base);
    border-radius: 8px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }
  .modeline {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 4px 0 12px;
    border-bottom: 1px solid var(--colors-skeleton-0-boundary);
    font-size: 10px;
    text-transform: lowercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
  }
  .body {
    flex: 1;
    overflow-y: auto;
    padding: 6px 0;
    font-size: 10px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 12px;
    border-bottom: 1px dashed var(--colors-skeleton-1-boundary);
  }
  .row.indent { padding-left: 24px; }
  .row.actions { background: var(--colors-skeleton-2-surface); }
  .group-label {
    padding: 6px 12px 2px;
    color: var(--colors-skeleton-2-contrast);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 9px;
  }
  .k {
    color: var(--colors-skeleton-2-contrast);
    flex: 0 0 38%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .v {
    color: var(--colors-skeleton-1-contrast);
    flex: 1;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    gap: 4px;
    justify-content: flex-end;
  }
  .mono { font-feature-settings: "tnum"; opacity: 0.85; }
  .seg.hi { color: var(--colors-skeleton-0-accent-base); font-weight: 600; }
  .seg.lo { color: var(--colors-skeleton-2-contrast); }
  .sep { color: var(--colors-skeleton-0-boundary); font-size: 10px; }
  .spacer { flex: 1; }
  .btn {
    height: 22px;
    min-width: 24px;
    padding: 0 6px;
    background: none;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    cursor: pointer;
  }
  .btn.mini {
    height: 18px;
    min-width: 20px;
    padding: 0 5px;
    font-size: 9px;
  }
  .btn.mini.danger:hover {
    background: var(--colors-skeleton-0-danger-base);
    color: var(--colors-skeleton-0-contrast);
    border-color: var(--colors-skeleton-0-danger-base);
  }
  .btn.close {
    border: none;
    font-size: 16px;
    height: 24px;
  }
  .btn.close:hover {
    color: var(--colors-skeleton-0-danger-base);
  }
  @media (max-width: 600px) {
    .overlay {
      left: 12px;
      right: 12px;
      width: auto;
    }
  }
</style>
