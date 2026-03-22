<script>
  let {
    src,
    type = "audio/mpeg",
    variant = "inline",
    preload = "auto",
    autoplay = false,
    class: className = "",
  } = $props();

  let playing = $state(false);
  let audio = $state(null);

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  const barCount = 7;
  const bars = $derived.by(() => {
    const seed = hashCode(src || "");
    return Array.from({ length: barCount }, (_, i) => {
      const h = ((seed * (i + 1) * 7919) % 60) + 40;
      return h;
    });
  });

  $effect(() => {
    if (!src) return;
    const a = new Audio();
    a.preload = preload;
    a.src = src;
    const onEnded = () => { playing = false; };
    a.addEventListener("ended", onEnded);
    if (autoplay) {
      a.play().then(() => { playing = true; }).catch(() => {});
    }
    audio = a;
    return () => {
      a.pause();
      a.removeEventListener("ended", onEnded);
      a.src = "";
    };
  });

  function toggle() {
    if (!audio) return;
    if (playing) {
      audio.pause();
      playing = false;
    } else {
      audio.currentTime = 0;
      audio.play();
      playing = true;
    }
  }
</script>

{#if variant === "inline"}
  <button
    class="audio-inline {className}"
    class:audio-playing={playing}
    onclick={toggle}
    aria-label={playing ? "Pause" : "Play"}
  >
    {#if playing}
      <svg viewBox="0 0 60 60" class="audio-bars">
        {#each bars as height, i}
          <rect
            x={6 + i * 7.5}
            y={30 - (height / 100) * 21}
            width="4"
            height={(height / 100) * 42}
            rx="2"
            class="audio-bar"
            style="animation-delay: {i * 0.08}s"
          />
        {/each}
      </svg>
    {:else}
      <svg viewBox="0 0 60 60" class="audio-play-icon">
        <path d="M22 16 L22 44 L46 30 Z" />
      </svg>
    {/if}
  </button>
{:else}
  {#if src}
    <audio controls {preload} {autoplay}>
      <source {src} {type} />
    </audio>
  {/if}
{/if}

<style>
  .audio-inline {
    width: 60px;
    height: 60px;
    border-radius: 14px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: var(--colors-skeleton-2-surface);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, border-color 0.15s;
  }

  .audio-inline:hover {
    background: var(--colors-skeleton-1-surface);
    border-color: var(--colors-skeleton-2-contrast);
  }

  .audio-inline.audio-playing {
    border-color: var(--colors-theme-primary-contrast);
  }

  .audio-bars {
    width: 42px;
    height: 42px;
  }

  .audio-play-icon {
    width: 32px;
    height: 32px;
  }

  .audio-play-icon path {
    fill: var(--colors-skeleton-2-contrast);
    transition: fill 0.15s;
  }

  .audio-inline:hover .audio-play-icon path {
    fill: var(--colors-theme-primary-contrast);
  }

  .audio-bar {
    fill: var(--colors-skeleton-2-contrast);
    transition: fill 0.15s;
  }

  .audio-playing .audio-bar {
    fill: var(--colors-theme-primary-contrast);
    animation: pulse 0.6s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    0% {
      transform-origin: center;
      transform: scaleY(0.6);
    }
    100% {
      transform-origin: center;
      transform: scaleY(1);
    }
  }
</style>
