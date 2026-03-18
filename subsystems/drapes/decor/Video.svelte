<script>
  let { src, type } = $props();
</script>

{#if src}
  <video controls preload="none">
    <source {src} {type} />
  </video>
{/if}
