<script>
  import { getContext } from "svelte";
  import { THREAD } from "$client";
  import { Vector, shape } from "@vivalence/typology";
  import { skins } from "@vivalence/drapes";
  const { Tree } = skins;

  const threadInstance = getContext(THREAD);

  let nodes = $state(null);

  threadInstance.$current.subscribe((thread) => {
    if (!thread) {
      nodes = null;
      return;
    }
    const vector = composeGraph(thread);
    nodes = shape.tree(vector);
  });

  function composeGraph(thread) {
    const graph = new Vector();

    for (const buffer of thread.buffers ?? []) {
      graph.open({
        nature: buffer.view ?? buffer.id,
        valence: { name: buffer.view ?? "buffer" },
      });
    }

    return graph;
  }
</script>

<div class="panel">
  {#if nodes}
    <Tree {nodes} />
  {:else}
    <div class="empty">no active thread</div>
  {/if}
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
  }
  .empty {
    padding: 12px 14px;
    opacity: 0.25;
    text-transform: lowercase;
    font-family: var(--font-family-code);
    font-size: 10px;
  }
</style>
