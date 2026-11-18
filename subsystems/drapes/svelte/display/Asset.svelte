<script>
  import Audio from "../decor/Audio.svelte";
  import Image from "../decor/Image.svelte";
  import Video from "../decor/Video.svelte";

  let { file, autoplay = false, preload = "auto", variant = "inline", onended = null } = $props();
  const kind = $derived(file?.mime?.split("/")[0]);
</script>

{#if kind === "audio"}
  <Audio src={file.url} type={file.mime} {preload} {autoplay} {variant} {onended} />
{:else if kind === "image"}
  <Image src={file.url} type={file.mime} {preload} />
{:else if kind === "video"}
  <Video src={file.url} type={file.mime} {preload} />
{/if}
