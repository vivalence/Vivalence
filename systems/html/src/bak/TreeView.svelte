<!--
  TreeView — pincer capability.
  Recursive tree, macOS/Blender style. Click row to toggle. Caret + indent.
  Pure renderer. Inherits colors from the surrounding skeleton context.
-->
<script>
  import { useSkeleton } from "@vivalence/drapes";

  let { node, depth = 0 } = $props();
  let open = $state(depth < 1);
  const hasKids = $derived(Array.isArray(node?.kids) && node.kids.length > 0);

  // Subscribe to skeleton context only at the root so children render
  // inside the same level via CSS variables (which are global anyway).
  const skeleton = useSkeleton();
  const level = $derived(skeleton());
</script>

<div
  class="row"
  class:clickable={typeof node?.onClick === "function"}
  style:padding-left="{depth * 14 + 8}px"
  style:--row-color="var(--colors-skeleton-{level}-contrast)"
  style:--row-caret="var(--colors-skeleton-{level}-primary-base)"
  style:--row-hover="var(--colors-skeleton-{level}-surface)"
  onclick={() => {
    if (typeof node?.onClick === "function") node.onClick();
    if (hasKids) open = !open;
  }}
>
  <span class="caret">{hasKids ? (open ? "▾" : "▸") : "·"}</span>
  <span class="name">{node?.name ?? "(unnamed)"}</span>
</div>

{#if open && hasKids}
  {#each node.kids as kid}
    <svelte:self node={kid} depth={depth + 1} />
  {/each}
{/if}

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 22px;
    font-family: var(--font-family-code);
    font-size: 11px;
    color: var(--row-color);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }
  .row:hover {
    background: var(--row-hover);
    filter: brightness(1.15);
  }
  .row.clickable .name {
    text-decoration: underline;
    text-decoration-color: var(--row-caret);
    text-underline-offset: 3px;
  }
  .caret {
    width: 10px;
    text-align: center;
    color: var(--row-caret);
    flex-shrink: 0;
  }
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
