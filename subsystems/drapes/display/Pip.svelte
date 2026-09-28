<script>
  let { size = 6, tone = "muted", pulse = false, glow = false } = $props();

  const tones = {
    primary: "var(--signal-primary)",
    warning: "var(--signal-caution)",
    danger: "var(--signal-negative)",
    success: "var(--signal-positive)",
    contrast: "var(--text-strong)",
    muted: "var(--text-muted)",
  };
</script>

<span
  class="pip"
  class:pulse
  class:glow
  style:--pip-size="{size}px"
  style:--pip-color={tones[tone] ?? tones.muted}
></span>

<style>
  .pip {
    display: inline-block;
    width: var(--pip-size);
    height: var(--pip-size);
    border-radius: var(--shape-radius-full);
    background: var(--pip-color);
    flex: none;
  }
  .pulse {
    animation: pip-pulse 1.8s ease-in-out infinite;
  }
  .glow {
    box-shadow: 0 0 6px var(--pip-color);
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
