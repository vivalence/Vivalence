<script>
  import { Key } from "@vivalence/drapes";

  let { active, level, disabled = false, fault = null, onstart, onstop } = $props();

  const busy = $derived($active === "arming" || $active === "settling");
  const listening = $derived($active === "listening");
</script>

<Key
  square
  size="row"
  latched={listening}
  disabled={disabled || busy}
  title={fault ?? (listening ? "settle dictation" : "dictate")}
  onpress={(event) => event.preventDefault()}
  onclick={() => (listening ? onstop?.() : onstart?.())}>
  <span class="dictaphone-pulse" class:listening style:transform="scale({1 + Math.min(($level ?? 0) * 6, 0.9)})"></span>
  <span class="dictaphone-glyph" class:busy></span>
</Key>

<style>
  .dictaphone-pulse {
    position: absolute;
    inset: 0;
    border-radius: var(--shape-radius-full);
    transform-origin: center;
    transition: transform 0.08s linear;
    pointer-events: none;
  }
  .dictaphone-pulse.listening {
    background: var(--signal-negative-tint);
  }
  .dictaphone-glyph {
    position: relative;
    width: 14px;
    height: 14px;
    background: currentColor;
    -webkit-mask: url(/icons/heroicons/20/solid/microphone.svg) center / contain no-repeat;
    mask: url(/icons/heroicons/20/solid/microphone.svg) center / contain no-repeat;
  }
  .dictaphone-glyph.busy {
    animation: dictaphone-arming 1.2s ease-in-out infinite;
  }
  @keyframes dictaphone-arming {
    50% {
      opacity: 0.3;
    }
  }
</style>
