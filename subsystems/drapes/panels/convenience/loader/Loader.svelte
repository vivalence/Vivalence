<script>
  import { onDestroy, onMount } from "svelte";
  import { Text } from "@vivalence/drapes";
  import expressions from "./expressions.js";

  let { load, time = {} } = $props();

  const VARIANCE = time.variance || 2000;
  const MINIMUM = time.minimum || 2000;

  let counter = $state(0);
  let interval;

  function pick(n) {
    return expressions[Math.floor(Math.random() * n + expressions.length) % expressions.length];
  }

  onMount(() => {
    if (load) interval = setInterval(() => { counter++; load(); }, Math.random() * VARIANCE + MINIMUM);
  });

  onDestroy(() => clearInterval(interval));
</script>

<div class="flex flex-col items-center justify-center">
  <progress class="progress progress-accent w-56"></progress>
  <Text class="mt-3">{pick(counter)} #{counter}</Text>
</div>

<!-- <script> -->
<!--   import { onDestroy, onMount } from "svelte"; -->
<!--   import { Text } from "@vivalence/drapes"; -->
<!--   import expressions from "./expressions.js"; -->

<!--   let { load, time = {} } = $props(); -->

<!--   expressions.random = (int) => -->
<!--     expressions[ -->
<!--       Math.floor(Math.random() * int + expressions.length) % expressions.length -->
<!--     ]; -->

<!--   const VARIANCE = time.variance || 2000; -->
<!--   const MINIMUM = time.minimum || 2000; -->

<!--   let counter = 0; -->
<!--   let interval; -->

<!--   const have = () => { -->
<!--     counter++; -->
<!--     load(); -->
<!--   }; -->

<!--   onMount(() => { -->
<!--     if (load) -->
<!--       interval = setInterval(have, Math.random() * VARIANCE + MINIMUM); -->
<!--   }); -->

<!--   onDestroy(() => { -->
<!--     clearInterval(interval); -->
<!--   }); -->
<!-- </script> -->

<!-- <div class="bsp-chain-end flex flex-col container justify-center items-center"> -->
<!--   <progress class="progress progress-accent w-56"></progress> -->
<!--   <Text class="mt-3">{expressions.random(counter)} #{counter}</Text> -->
<!-- </div> -->
