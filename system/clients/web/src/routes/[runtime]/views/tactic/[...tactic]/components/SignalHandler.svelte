<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let { signal } = $props();

  let ui = $state();

  onMount(() => {
    switch (signal.type) {
      case "COMPLETED":
        ui = "<h1>Dependency Satisfied</h1>";
        setTimeout(() => goto("/"), 2000);
        break;
      case "REPETITION":
        ui = "<h1>Repetition of Tactic</h1>";
        // setTimeout(() => locals.onGameFinish(), 2000);
        break;
      case "ERROR":
        ui = signal.error.message;
        break;
      default:
        break;
    }
  });
</script>

{#if ui}
  <section
    class="container text-skeleton-contrast-1 mx-auto sm:px-10 md:px-24 mt-12 mb-20">
    <!-- <section class="container mx-auto sm:px-10 md:px-24 mt-12 mb-20"> -->
    {@html ui}
  </section>
{/if}
