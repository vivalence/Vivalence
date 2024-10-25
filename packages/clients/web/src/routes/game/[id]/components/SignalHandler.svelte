<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  export let locals;
  export let data;
  let ui;

  onMount(() => {
    switch (data.signal) {
      case "COMPLETED":
        ui = "<h1>Dependency Satisfied</h1>";
        setTimeout(() => goto("/"), 2000);
        break;
      case "REPETITION":
        ui = "<h1>Repetition of Tactic</h1>";
        setTimeout(() => locals.onGameFinish(), 2000);
        break;
      default:
        break;
    }
  });
</script>

{#if ui}
  <section class="container mx-auto sm:px-10 md:px-24 mt-12 mb-20">
    {@html ui}
  </section>
{/if}
