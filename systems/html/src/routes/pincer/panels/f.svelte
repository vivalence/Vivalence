<script>
  import { getContext } from "svelte";
  import { THREAD } from "$client";
  import { Vector, stamp, shape } from "@vivalence/typology";
  import { skins } from "@vivalence/drapes";
  const { Dag } = skins;

  const threadInstance = getContext(THREAD);

  let vector = $state(null);
  let pojo = $state({ effects: [], trajectories: [] });

  threadInstance.$current.subscribe((thread) => {
    if (!thread) {
      vector = null;
      pojo = { effects: [], trajectories: [] };
      return;
    }
    vector = composeGraph(thread);
    pojo = shape.pojo(vector);
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
  {#if vector}
    <Dag {pojo} />
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
