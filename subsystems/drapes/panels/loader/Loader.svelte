<script>
  import { onDestroy, onMount } from "svelte";
  import expressions from "./expressions.js";

  let { load, time = {} } = $props();

  const VARIANCE = time.variance || 2000;
  const MINIMUM = time.minimum || 2000;

  let counter = $state(0);
  let mounted = $state(false);
  let interval;

  function pick(n) {
    return expressions[Math.floor(Math.random() * n + expressions.length) % expressions.length];
  }

  onMount(() => {
    requestAnimationFrame(() => { mounted = true; });
    if (load) interval = setInterval(() => { counter++; load(); }, Math.random() * VARIANCE + MINIMUM);
  });

  onDestroy(() => clearInterval(interval));
</script>

<div class="loader" class:mounted>
  <div class="icon-container">
    <div class="glow"></div>
    <img class="icon" src="/static/images/pictogram_viket/pic-vinca-viket_white.svg" alt="" />
  </div>

  <!-- <img class="wordmark" src="/logo/vivalence-white.svg" alt="vivalence" /> -->

  <!-- <\!-- <span class="expression">{pick(counter)}</span> -\-> -->
</div>

<style>
  .loader {
    display: grid;
    place-items: center;
    align-content: center;
    gap: 1.5rem;
    height: 100%;
    min-height: 100svh;
    background: var(--colors-skeleton-app-surface);
    opacity: 0;
    transition: opacity 0.6s ease;
  }

  .loader.mounted {
    opacity: 1;
  }

  .icon-container {
    position: relative;
    width: clamp(128px, 32vw, 256px);
  }

  .glow {
    position: absolute;
    inset: -40%;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--colors-theme-primary-surface) 20%, transparent) 0%,
      transparent 70%
    );
    animation: glow-pulse 4s ease-in-out infinite;
  }

  .icon {
    position: relative;
    width: 100%;
    height: auto;
  }

  /* .wordmark {width: clamp(120px, 32vw, 200px); height: auto; opacity: 0; animation: fade-in 1s ease 0.3s forwards;} */

  .expression {
    font-family: var(--font-family-brand);
    font-size: var(--font-size-sm);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0;
    animation: fade-in 1s ease 0.8s forwards;
  }

  @keyframes fade-in {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }

  @keyframes glow-pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.95); }
    50%      { opacity: 0.8; transform: scale(1.05); }
  }
</style>
