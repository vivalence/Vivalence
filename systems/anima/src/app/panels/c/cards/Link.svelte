<script>
  import { getContext } from "svelte";
  import { stores } from "@vivalence/anima";
  import { BRIDGE } from "$client";

  let { pane, title = null, children } = $props();

  const bridge = getContext(BRIDGE);

  function follow(event) {
    event.stopPropagation();
    const next = stores.bridge.panes.reveal({ tree: bridge.panels.c.tree }, pane, stores.bridge.railGrain(bridge));
    bridge.panels.c.tree = next.tree;
    bridge.panels.c.expanded = next.expanded;
    bridge.save();
  }
</script>

<button class="card-link" title={title ?? `open ${pane}`} onclick={follow}>{@render children()}<span class="card-link-arrow">›</span></button>

<style>
  .card-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    font-size: 11px;
    color: var(--text-link);
    cursor: pointer;
    white-space: nowrap;
  }
  .card-link:hover {
    text-decoration: underline;
  }
  .card-link-arrow {
    color: var(--text-light);
  }
</style>
