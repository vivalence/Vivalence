<script>
  import { onMount, onDestroy, getContext, tick } from "svelte";

  import { createStore } from "./store.js";
  import Prompt from "./components/Prompt.svelte";
  import Table from "./components/Table.svelte";
  import Footer from "./components/Footer.svelte";

  export let trajectory;
  export let locals;
  export let scope;
  export let instruction;

  const store = createStore({ locals });

  $: if (!$store.revealed) {
    trajectory.use((t) => {
      t.set(t.signals.keyboard["Enter"](), store.evaluate);
    });
  } else {
    trajectory.use((t) => {
      t.set(t.signals.keyboard["Enter"](), store.finish);
    });
  }

  $: if (instruction && scope) {
    store.update((s) => ({ ...s, instruction, scope }));
  }
</script>

<section class="container mx-auto sm:px-10 md:px-24 mt-12 mb-20">
  {#if $store.instruction}
    <Prompt />
    <Table />
  {/if}
</section>

<Footer />
