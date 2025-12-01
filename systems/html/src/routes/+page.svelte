<script>
  import { goto } from "$app/navigation";
  import { Text, Button, Input, Pictogram } from "@vivalence/drapes";

  import { lighthouse } from "$client";
  import { view } from "@vivalence/html/surface";

  let isIdentified = lighthouse.isIdentified;
</script>

<div class="hidden">
  {#if $isIdentified}
    {goto("/viva")}
  {/if}
</div>

<div class="bsp-node relative w-full h-full overflow-hidden">
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

  <div class="bsp-node h2 gap-0 relative z-20">
    <div class="bsp-node flex items-center justify-center"></div>

    <div class="bsp-node flex items-center justify-center">
      <div
        class="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-8 w-full max-w-md">
        <view.lighthouse.Login {lighthouse} />
      </div>
    </div>
  </div>
</div>

<!-- <script> -->
<!-- 	import { goto } from "$app/navigation"; -->
<!-- 	import { Text, Button, Input } from "@vivalence/drapes"; -->

<!-- 	// @ikiro -->
<!-- 	// html/static/videos/720x480p-flight10-seldoncrisis-entry-vhs-16fps.mp4 -->
<!-- 	// import this and render it as the background. playpack speed should be .25% speed. -->

<!-- 	import { lighthouse } from "$client"; -->
<!-- 	import * as view from "$client/view"; -->

<!-- 	let isIdentified = lighthouse.isIdentified; -->
<!-- </script> -->

<!-- <div class="hidden"> -->
<!-- {#if $isIdentified} -->
<!-- 	{goto("/viva")} -->
<!-- {/if} -->
<!-- </div> -->

<!-- <node full size bsp node. rounded boundry. standard node corner rounding 42pixel. brand wide standard. deviations are achieved by fractions of 42.> -->
<!--  <\!-- // and then i want the video running at .25% looped covering teh full background insde the node, nothing outside -\-> -->
<!--   <\!--  -\-> -->
<!-- </node> -->

<!-- <div class="bsp-node h2"> -->
<!-- 	<\!-- <div class="bsp-node only "> <img src="/static/images/vinca-viket-white.png" /> </div> -\-> -->

<!-- 	<div class="bsp-node"> -->
<!-- 		<view.lighthouse.Login {lighthouse} /> -->
<!-- 	</div> -->
<!-- </div> -->
