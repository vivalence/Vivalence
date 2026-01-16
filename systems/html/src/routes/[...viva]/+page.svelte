<script>
  import { page } from "$app/stores";
  import BufferView from "./View.svelte";
</script>

{#key $page.url.pathname}
  <BufferView pathname={$page.url.pathname} />
{/key}
