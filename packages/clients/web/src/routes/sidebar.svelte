<script>
  import "../style/app.css";
  import "../style/bsp/bsp.css";

  import { writable } from "svelte/store";

  import { initTreeState } from "@vivalence/components/Tree/context.js";
  import Tree from "@vivalence/components/Tree/Tree.svelte";

  let { menudata } = $props();

  const tree = initTreeState({ root: menudata, isOpen: true });
</script>

{#if tree.isOpen}
  <aside class="sidebar grid-container mr-6">
    <Tree />
  </aside>
{:else}
  <button class="sidebar-open" on:click={() => tree.toggle(true)}>
    <span>{">"}</span>
  </button>
{/if}

<style>
  .sidebar {
    @apply w-64 p-0;

    @apply bg-skeleton-surface-1 border-skeleton-boundary-1 text-skeleton-contrast-1;
    @apply rounded-lg shadow-md border;
  }

  .sidebar-open {
    position: absolute;
    @apply bg-skeleton-surface-1 border-skeleton-boundary-1 text-skeleton-contrast-1;
    transform: translateX(-110%);
    span {
      margin-right: -15px;
    }
    @apply w-12 h-12 rounded-lg shadow-md border;
  }
</style>
