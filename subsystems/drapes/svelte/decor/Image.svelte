<script>
  let { src, alt = "", type } = $props();
</script>

{#if src}
  <img {src} {alt} />
{/if}
