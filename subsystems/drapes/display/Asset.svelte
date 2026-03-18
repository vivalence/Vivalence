<script>
  import Audio from "../decor/Audio.svelte";
  import Image from "../decor/Image.svelte";
  import Video from "../decor/Video.svelte";

  let { asset, autoplay = false } = $props();
  const kind = $derived(asset?.type?.split("/")[0]);
</script>

{#if kind === "audio"}
  <Audio src={asset.url} type={asset.type} {autoplay} />
{:else if kind === "image"}
  <Image src={asset.url} type={asset.type} />
{:else if kind === "video"}
  <Video src={asset.url} type={asset.type} />
{/if}
