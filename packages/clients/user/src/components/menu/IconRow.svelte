<script>
  export let icons;
</script>

<div class="flex justify-around items-center h-full">
    {#each icons as icon}
	<div class="${icon.color} w-6 h-6"></div>
    {/each}
</div>
  
