<script>
  import { onDestroy, onMount } from "svelte";
  import { getStore } from "../store.js";

  const store = getStore();

  const VARIANCE = 2000;
  let MINIMUM = 2000;

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
    /* interval = setInterval(loadStatus, Math.random() * VARIANCE + MINIMUM); */
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  const expressions = [
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
  ];
</script>

<div>{expressions[counter % expressions.length]} #{counter}</div>
