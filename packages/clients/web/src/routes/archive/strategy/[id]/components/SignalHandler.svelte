<script>
  import { onMount } from "svelte";
  import { getStore } from "../store.js";

  const store = getStore();

  export let data;
  /* export let locals; */
  /* export let trajectory; */

  console.log("SIGNAL COMPLETED", data);
  onMount(() => {
    switch (data.instruction.signal) {
      case "COMPLETED":
        console.log("SIGNAL COMPLETED", data);
        break;
      case "REPETITION":
        store.incrementSession();
        break;
      default:
        break;
    }
    store.next();
  });
</script>
