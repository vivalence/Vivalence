<script>
  import { onDestroy, onMount } from "svelte";
  import expressions from "./expressions.js";

  let { load, time = {} } = $props();

  expressions.random = (int) =>
    expressions[
      Math.floor(Math.random() * int + expressions.length) % expressions.length
    ];

  const VARIANCE = time.variance || 2000;
  const MINIMUM = time.minimum || 2000;

  let counter = 0;
  let interval;

  const have = () => {
    counter++;
    load();
  };

  onMount(() => {
    if (load)
      interval = setInterval(have, Math.random() * VARIANCE + MINIMUM);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="bsp-chain-end flex flex-col container justify-center items-center">
  <progress class="progress progress-accent w-56"></progress>
  <div class="mt-3">{expressions.random(counter)} #{counter}</div>
</div>
