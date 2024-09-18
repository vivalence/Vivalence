<script>
  import { onMount } from "svelte";
  import { getStore } from "../store.js";

  const store = getStore();

  export let data;
  /* export let locals; */
  /* export let trajectory; */

  onMount(() => {
    switch (data.instruction.message) {
      case "REPETITION":
        store.incrementSession();
        break;
      default:
        break;
    }
    store.next();
  });
</script>
