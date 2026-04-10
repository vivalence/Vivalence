<script>
  import { getContext } from "svelte";
  import { QUARTERS, BRIDGE } from "$client";

  const quarters = getContext(QUARTERS);
  const { view, toggle } = getContext(BRIDGE);

  let show = $state(view.$inspectQuarters.get());
  view.$inspectQuarters.subscribe(v => show = v);

  let active = $state(quarters.$active.get());
  let terminal = $state(quarters.$terminal.get());
  let entities = $state(quarters.terminals.$entities.get());

  quarters.$active.subscribe(v => active = v);
  quarters.$terminal.subscribe(v => terminal = v);
  quarters.terminals.$entities.subscribe(v => entities = v);
</script>

{#if show}
  <div class="overlay">
    <div class="modeline">
      <span class="seg hi">Q</span>
      <span class="sep">›</span>
      <span class="seg lo">quarters</span>
      <span class="spacer"></span>
      <button class="btn close" onclick={() => toggle("inspectQuarters")}>×</button>
    </div>
    <div class="body">
      <div class="row"><span class="k">$active</span><span class="v mono">{active ?? "—"}</span></div>
      <div class="row"><span class="k">$terminal.id</span><span class="v mono">{terminal?.id ?? "—"}</span></div>
      <div class="row"><span class="k">$terminal.kind</span><span class="v">{terminal?.kind ?? "—"}</span></div>
      <div class="row"><span class="k">terminals.count</span><span class="v">{entities.length}</span></div>
      <div class="group">
        <div class="group-label">entities</div>
        {#each entities as entity (entity.id)}
          <div class="row indent">
            <span class="k mono">{entity.id}</span>
            <span class="v">
              <button
                class="btn mini"
                class:on={entity.id === active}
                onclick={() => quarters.activate(entity.id)}
                title="activate"
              >▸</button>
              <button
                class="btn mini danger"
                onclick={() => quarters.close(entity.id)}
                title="close"
              >×</button>
            </span>
          </div>
        {/each}
      </div>
      <div class="row actions">
        <span class="k">actions</span>
        <span class="v">
          <button class="btn mini" onclick={() => quarters.spawn()}>+ spawn</button>
        </span>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 58px;
    left: calc(25vw + 4px);
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
    flex: 0 0 42%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .v {
    color: var(--colors-skeleton-1-contrast);
    flex: 1;
    text-align: right;
    white-space: nowrap;
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
  .btn.mini.on {
    background: var(--colors-skeleton-0-accent-base);
    color: var(--colors-skeleton-0-contrast);
    border-color: var(--colors-skeleton-0-accent-base);
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
