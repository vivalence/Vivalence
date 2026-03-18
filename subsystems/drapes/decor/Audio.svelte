<script>
  let { src, type, autoplay = false } = $props();
</script>

{#if src}
  <audio controls preload={autoplay ? "auto" : "none"} {autoplay}>
    <source {src} {type} />
  </audio>
{/if}
