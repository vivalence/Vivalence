<script>
  let { size = 6, tone = "muted", pulse = false } = $props();

  const tones = {
    primary: "var(--colors-skeleton-0-primary-base)",
    warning: "var(--colors-skeleton-0-warning-base)",
    danger: "var(--colors-skeleton-0-danger-base)",
    contrast: "var(--colors-skeleton-0-contrast)",
    muted: "color-mix(in srgb, currentColor 40%, transparent)",
  };
</script>

<span
  class="pip"
  class:pulse
  style:--pip-size="{size}px"
  style:--pip-color={tones[tone] ?? tones.muted}
></span>

<style>
  .pip {
    display: inline-block;
    width: var(--pip-size);
    height: var(--pip-size);
    border-radius: 50%;
    background: var(--pip-color);
    flex: none;
  }
  .pulse {
    animation: pip-pulse 1.8s ease-in-out infinite;
  }
  @keyframes pip-pulse {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.95;
    }
  }
</style>
