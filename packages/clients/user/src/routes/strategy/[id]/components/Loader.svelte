<script>
  import { onDestroy, onMount } from "svelte";
  import { getStore } from "../store.js";

  const expressions = [
    "Embracing Life",
    "Unfolding Horizons",
    "Preparing Liftoff",
    "Harmonizing Frequencies",
    "Charging Capacitors",
    "Optimizing Trajectory",
    "Foraging Path",
    "Igniting Curiosity",
    "Aligning Stars",
    "Cultivating Ideas",
    "Calibrating Instruments",
    "Gathering Insights",
    "Navigating Dreams",
    "Envisioning Possibilities",
    "Decrypting Codes",
    "Mapping Constellations",
    "Synchronizing Clocks",
    "Evolving Patterns",
    "Fostering Growth",
    "Building Bridges",
    "Connecting Dots",
    "Weaving Stories",
    "Crafting Narratives",
    "Designing Futures",
    "Empowering Voices",
    "Inspiring Change",
    "Transforming Realities",
    "Shaping Worlds",
    "Dreaming Big",
    "Thinking Small",
    "Acting Now",
    "Creating Tomorrow",
    "Embracing Today",
    "Living Fully",
    "Loving Deeply",
    "Laughing Loudly",
    "Dreaming Wildly",
    "Thinking Freely",
    "Acting Boldly",
    "Creating Joy",
  ];

  expressions.random = (int) =>
    expressions[Math.floor(Math.random() * int + expressions.length) % expressions.length];

  const store = getStore();

  const VARIANCE = 2000;
  const MINIMUM = 2000;

  let counter = 0;
  let interval;

  const loadStatus = () => {
    if (!$store.error) {
      store.load();
    }
    counter++;
  };

  onMount(() => {
    loadStatus();
    interval = setInterval(loadStatus, Math.random() * VARIANCE + MINIMUM);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="flex flex-col container justify-center items-center h-screen">
  <progress class="progress progress-accent w-56"></progress>
  <div class="mt-3">{expressions.random(counter)} #{counter}</div>
</div>
