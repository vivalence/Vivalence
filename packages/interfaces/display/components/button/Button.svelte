<script>
  export let trigger;
  export let label;
</script>

<button class={`btn btn-neutral `} on:click|stopPropagation={trigger}>
    {label}
</button>
