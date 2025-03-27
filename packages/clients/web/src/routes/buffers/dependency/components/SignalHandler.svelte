<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let { instruction, runtime, dependency, next } = $props();
  /* console.log("Signal Handler: instruction, runtime, dependency", instruction, runtime, dependency); */

  let ui = $state();

  onMount(() => {
    switch (instruction.signal) {
      case "COMPLETED":
        ui = "Dependency satisfied";
        setTimeout(() => goto(`/runtime/${runtime.slug}/dependencies`), 2000);
        break;
      case "REPETITION":
        ui = "Rep master general.";
        setTimeout(() => next(), 1000);
        break;
      case "ERROR":
        ui = instruction.error.message;
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
