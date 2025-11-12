<script>
	import { goto } from "$app/navigation";
	import { Text, Button, Input } from "@vivalence/drapes";
	// $static/images/banner.png

	import { lighthouse } from "$hut";
	import * as view from "$hut/view";

	let isIdentified = lighthouse.isIdentified;
</script>

{#if $isIdentified}
	{goto("/viva")}
{/if}

<div class="bsp-node h2 items-center px-24 debug-*">
	<!-- <div class="bsp-node h2 text-center"> -->
	<!-- 	<Text weight="bold" size="2xl">home</Text> -->
	<!-- </div> -->
	<div class="bsp-node  pt-12"> <img src="/static/images/banner.png" /> </div>
	<div class="bsp-node">

		<view.lighthouse.Login {lighthouse} />
	</div>
</div>
