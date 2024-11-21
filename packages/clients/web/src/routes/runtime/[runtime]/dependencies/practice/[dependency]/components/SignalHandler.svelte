<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let { instruction, runtime, dependency } = $props();
  /* console.log("Signal Handler: instruction, runtime, dependency", instruction, runtime, dependency); */

  let ui = $state();

  onMount(() => {
    switch (instruction.signal) {
      case "COMPLETED":
        ui = "Dependency Satisfied";
        setTimeout(() => goto(`/runtime/${runtime.slug}/dependencies/view`), 2000);
        break;
      case "REPETITION":
        ui = "Repetition of Tactic";
        /* setTimeout(() => locals.onGameFinish(), 2000); */
        break;
      case "ERROR":
        ui = instruction.error.message;
        /* setTimeout(() => locals.onGameFinish(), 2000); */
        break;
      default:
        break;
    }
  });
</script>

{#if ui}
  <section class="container text-skeleton-contrast-1 mx-auto sm:px-10 md:px-24 mt-12 mb-20">
    {@html ui}
  </section>
{/if}
