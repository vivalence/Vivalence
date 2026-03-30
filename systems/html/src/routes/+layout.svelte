<script>
  import "@vivalence/dapper/font.css";
  import "../client.css";

  import { dev } from "$app/environment";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { lighthouse } from "$client";

  // onMount(() => {if (!dev) return; const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/eruda"; s.onload = () => eruda.init(); document.head.appendChild(s);});

  let { children } = $props();
  let isIdentified = lighthouse.$isIdentified;

  $effect(() => {
    if (!$isIdentified && $page.url.pathname !== "/") goto("/");
  });
</script>

<div class="viva-root bg-skeleton-app-surface">
  {@render children()}
</div>

<style>
  .viva-root {
    position: fixed;
    top: var(--viva-t, 0px);
    left: 0;
    width: 100%;
    height: var(--viva-h, 100dvh);
    overflow: hidden;
  }
</style>
