<script>
  import { Buffer } from "@vivalence/interface";
  const { data } = $props();

  // import { page } from '$app/stores';
  // $: currentPath = $page.url.pathname;
</script>

<div class="bsp-chain-root">
  <Buffer buffer={data.buffer} />
</div>
