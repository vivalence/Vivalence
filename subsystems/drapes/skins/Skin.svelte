<script>
  import Tree from "./Tree.svelte"
  import Table from "./Table.svelte"
  import List from "./List.svelte"
  import Palette from "./Palette.svelte"
  import Breadcrumb from "./Breadcrumb.svelte"

  let { nodes, variant = "tree" } = $props()
</script>

{#if variant === "table"}
  <Table {nodes} />
{:else if variant === "list"}
  <List {nodes} />
{:else if variant === "palette"}
  <Palette {nodes} />
{:else if variant === "breadcrumb"}
  <Breadcrumb {nodes} />
{:else}
  <Tree {nodes} />
{/if}
