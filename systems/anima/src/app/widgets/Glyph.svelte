<script>
  let { name, set = "carbon/32", size = 14, pulse = false } = $props();
</script>

<span
  class="glyph"
  class:pulse
  style:--glyph-mask="url(/icons/{set}/{name}.svg)"
  style:--glyph-size="{size}px"
  aria-hidden="true"></span>

<style>
  .glyph {
    flex: none;
    width: var(--glyph-size);
    height: var(--glyph-size);
    background: currentColor;
    -webkit-mask: var(--glyph-mask) center / contain no-repeat;
    mask: var(--glyph-mask) center / contain no-repeat;
  }
  .glyph.pulse {
    animation: glyph-pulse 1.2s ease-in-out infinite;
  }
  @keyframes glyph-pulse {
    50% {
      opacity: 0.45;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .glyph.pulse {
      animation: none;
    }
  }
</style>
