<script>
  import { goto } from "$app/navigation";
  import { Pictogram } from "@vivalence/drapes";
  import { lighthouse } from "$client";
  import { view } from "@vivalence/html/surface";

  let isIdentified = lighthouse.$isIdentified;
</script>

{#if $isIdentified}
  <div class="hidden">{goto("/viva")}</div>
{/if}

<div class="relative w-full h-full overflow-hidden">
  <div class="absolute inset-0 z-0">
    <Pictogram
      src="/static/videos/720x480p-flight10-seldoncrisis-entry-vhs-16fps.mp4"
      type="video"
      size="cover"
      autoplay={true}
      loop={true}
      muted={true}
      playbackRate={3}
      class="w-full h-full opacity-10" />
  </div>
  <div class="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
  <div class="viva-surface flex items-center justify-center relative z-20">
    <div class="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-8 w-full max-w-md">
      <view.lighthouse.Login {lighthouse} />
    </div>
  </div>
</div>
