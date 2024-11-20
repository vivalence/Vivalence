<script lang="ts">
  import { goto } from "$app/navigation";
  import { Text, Icon } from "@vivalence/ui";
  import type { TreeNode } from "./types.d.ts";
  import { getTreeState } from "./context.js";
  import Row from "./Row.svelte";
  import Self from "./Node.svelte";

  const tree = getTreeState();
  let { node } = $props<{ node: TreeNode }>();
  let isOpen = $state(false);

  function handleClick() {
    const tree = getTreeState();
    if (node.onclick) node.onclick({ ...node, isOpen });
    if (node.href) {
      goto(node.href);
      tree.toggle();
    }
    if (node.nodes) {
      if (node.type === "link") tree.setState(node);
      if (node.type === "node") isOpen = !isOpen;
    }
  }
  const classes = {};
  if (node.type === "divider") {
    classes["row"] = "";
  }
</script>

{#if node.type !== "divider"}
  <Row {classes}>
    {#snippet nav()}
      {#if node.type === "node" && node.nodes}
        <a href="" onclick={() => (isOpen = !isOpen)}>
          <Icon carbon="ChevronRight" size="sm" variant="nav" class={isOpen && "rotate-90"} />
        </a>
      {/if}
    {/snippet}

    {#snippet icon()}
      {#if node.icon}
        <Icon {...node.icon} size="sm" variant="ui" />
      {/if}
    {/snippet}

    {#snippet content()}
      {#if node.title}
        {#if node.onclick || node.href}
          <a href={node.href || ""} onclick={handleClick}>
            <Text spacing="none">{node.title}</Text>
          </a>
        {:else}
          <Text spacing="none">{node.title}</Text>
        {/if}
      {/if}
    {/snippet}

    {#snippet link()}
      {#if node.type === "link"}
        <a href={node.href || ""} onclick={handleClick}>
          <Icon carbon="ChevronRight" size="sm" variant="nav" />
        </a>
      {/if}
    {/snippet}
  </Row>

  {#if node.type === "node" && node.nodes && isOpen}
    {#each node.nodes as childNode (childNode.title)}
      <Self node={childNode} />
    {/each}
  {/if}
{:else}
  <hr class="border-t border-theme-border-1 my-1 mx-4" />
{/if}
