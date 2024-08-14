<script>
  export let trigger;
  export let label;
</script>

<button class={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-2 rounded`} on:click|stopPropagation={trigger}>
    {label}
</button>
