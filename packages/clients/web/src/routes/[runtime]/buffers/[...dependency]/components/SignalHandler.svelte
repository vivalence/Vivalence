<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let { ctx, signal, release } = $props();
  console.log("Signal Handler: ", ctx, signal, releace);

  let ui = $state();

  onMount(() => {
    switch (signal.type) {
      case "COMPLETED":
        ui = "Dependency satisfied";
        throw new Error("expected, ctx.runtime not defined in dependency buffer signal handler");
        setTimeout(() => goto(`/runtime/${ctx.runtime.slug}/dependencies`), 2000);
        break;
      case "REPETITION":
        ui = "Rep master general.";
        setTimeout(() => next(), 1000);
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
  <section class="container text-skeleton-contrast-1 mx-auto sm:px-10 md:px-24 mt-12 mb-20">
    {@html ui}
  </section>
{/if}
