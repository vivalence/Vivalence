<script>
  import Key from "../controls/Key.svelte";

  let { label, active = false, mark = null, onclick, onmark, disabled = false, title = null } = $props();

  const marked = (event) => {
    event.stopPropagation();
    onmark?.();
  };
</script>

<Key size="row" led latched={active} {disabled} {title} {onclick}>
  {label}
  {#if mark}
    <span class="chip-mark" role="button" tabindex="-1" onclick={marked} onkeydown={(event) => event.key === "Enter" && marked(event)}>{mark}</span>
  {/if}
</Key>

<style>
  .chip-mark {
    opacity: 0.7;
    cursor: pointer;
  }
  .chip-mark:hover {
    opacity: 1;
  }
</style>
