<script>
  import Key from "./Key.svelte";

  let { options = [], value = null, size = "row", cell = 64, onpick } = $props();

  const held = $derived(options.map((option) => (typeof option === "string" ? { value: option, label: option } : option)));
</script>

<div class="segmented" style:--segmented-cell="{cell}px">
  {#each held as option (option.value)}
    <Key {size} wide latched={option.value === value} label={option.label} title={option.title ?? null} onclick={() => onpick?.(option.value)} />
  {/each}
</div>

<style>
  .segmented {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--segmented-cell), 1fr));
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
</style>
