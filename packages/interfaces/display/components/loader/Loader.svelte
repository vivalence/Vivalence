<script>
  import { onDestroy, onMount } from "svelte";
  import expressions from "./expressions.js";

  let { load } = $props();

  expressions.random = (int) =>
    expressions[
      Math.floor(Math.random() * int + expressions.length) % expressions.length
    ];

  const VARIANCE = 2000;
  const MINIMUM = 2000;

  let counter = 0;
  let interval;

  const loadStatus = () => {
    if (load) {
      load();
      console.log("@interfaces Loader.svelte load function called");
    } else {
      console.log("@interfaces Loader.svelte No load function provided");
    }
    counter++;
  };

  onMount(() => {
    /* loadStatus(); */
    interval = setInterval(loadStatus, Math.random() * VARIANCE + MINIMUM);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="bsp-chain-end flex flex-col container justify-center items-center ">
  <progress class="progress progress-accent w-56"></progress>
  <div class="mt-3">{expressions.random(counter)} #{counter}</div>
</div>
