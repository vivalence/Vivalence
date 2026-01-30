<script>
  import { page } from "$app/stores";
  import View from "./View.svelte";
</script>

{#key $page.url.pathname}
  <View pathname={$page.url.pathname} />
{/key}
