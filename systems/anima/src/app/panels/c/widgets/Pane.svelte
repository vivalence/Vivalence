<script>
  import { Key } from "@vivalence/drapes";

  let {
    name,
    label = name,
    folded = false,
    flowing = false,
    grabbable = false,
    tappable = false,
    dragged = false,
    aimed = false,
    alone = false,
    ongrab,
    ontap,
    onsolo,
    onpark,
    actions,
    children,
  } = $props();

  const keyed = (event) => Boolean(event.target.closest("button"));

  const grab = (event) => {
    if (!grabbable || keyed(event)) return;
    ongrab?.(event, name);
  };

  const tap = (event) => {
    if (!tappable || keyed(event)) return;
    ontap?.(name);
  };
</script>

<div class="pane" class:dragged class:aimed class:flowing>
  <div class="pane-head" class:grabbable class:tappable role="presentation" onpointerdown={grab} onclick={tap}>
    <span class="pane-label">{label}</span>
    <span class="pane-spring"></span>
    {#if actions}<span class="pane-actions">{@render actions()}</span>{/if}
    <Key tone="ghost" size="mini" square latched={alone} label={alone ? "⤡" : "⤢"} title={alone ? "give the tree back" : "solo"} onclick={() => onsolo?.(name)} />
    <Key tone="ghost" size="mini" square label="✕" title="park" onclick={() => onpark?.(name)} />
  </div>
  {#if !folded}
    <div class="pane-body">{@render children?.()}</div>
  {/if}
</div>

<style>
  .pane {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface);
    color: var(--text-strong);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    transition: opacity 0.12s, box-shadow 0.12s;
  }
  .pane.flowing {
    height: auto;
  }
  .pane.dragged {
    opacity: 0.45;
  }
  .pane.aimed {
    box-shadow: 0 0 0 1.5px var(--signal-primary);
  }
  .pane-head {
    flex: 0 0 var(--pane-head);
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 4px 0 10px;
    border-bottom: var(--size-ring) solid var(--boundary);
    user-select: none;
    touch-action: manipulation;
  }
  .pane-head.grabbable {
    cursor: grab;
    touch-action: none;
  }
  .pane-head.tappable {
    cursor: pointer;
  }
  .pane-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--signal-primary-ink);
  }
  .pane-spring {
    flex: 1;
    min-width: 0;
  }
  .pane-actions {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
  .pane-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 4px 6px 8px;
    background: var(--surface-lift);
    color: var(--text-strong);
  }
  .pane.flowing .pane-body {
    flex: 0 0 auto;
    overflow: visible;
  }
</style>
