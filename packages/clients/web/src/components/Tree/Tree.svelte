<script >
  import { Text, Icon } from "@vivalence/interface";

  import { getTreeState } from "./context.js";

  import Node from "./Node.svelte";
  import Row from "./Row.svelte";

  const tree = getTreeState();
  const closeTree = () => tree.toggle();
  const handleBack = () => tree.reset();
</script>

<div class="bsp-node flex flex-col font-sans-text h-full">
  <Row
    size="lg"
    classes={{
      row: "border-b border-skeleton-boundary-1",
      link: "border-l border-skeleton-boundary-1",
    }}>
    {#snippet nav()}
      {#if !tree.isRoot}
        <a href="" onclick={handleBack}>
          <Icon carbon="ChevronLeft" size="sm" variant="nav" />
        </a>
      {/if}
    {/snippet}
    {#snippet icon()}
      <Icon {...tree.state.icon} size="md" variant="ui" />
    {/snippet}
    {#snippet content()}
      <Text spacing="none">{tree.state.title}</Text>
    {/snippet}
    {#snippet link()}
      <a href="" onclick={closeTree}>
        <Icon carbon="DownToBottom" size="sm" variant="nav" class="rotate-90" />
      </a>
    {/snippet}
  </Row>

  {#if tree.state}
    <div class="flex-grow">
      {#each tree.state.nodes || [] as node (node.title)}
        <Node {node} />
      {/each}
    </div>
  {/if}
  <div class="mt-auto"></div>
</div>

<style>
  * {
    /* border: 1px solid red; */
  }
</style>
