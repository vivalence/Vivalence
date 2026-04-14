<script>
  import Filter from "./Filter.svelte"
  import List from "./List.svelte"

  let { nodes } = $props()

  let query = $state("")

  const filtered = $derived(query.length === 0 ? nodes : nodes.filter((node) => (node.display ?? node.nature).includes(query)))
</script>

<div class="skin-palette">
  <Filter bind:query />
  <List nodes={filtered} />
</div>

<style>
  .skin-palette { display: flex; flex-direction: column; gap: 8px; }
</style>
