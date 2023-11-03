<script>
  import Button from './Button.svelte';
  export let imgSrc;
  export let title = "Name";
  export let button = "Play";
</script>

<div class="border p-4 rounded">
  <img src="{imgSrc}"  class="rounded mb-4 border" />
  <h2 class="text-lg mb-4">{title}</h2>
  <Button label={button}/>
</div>
