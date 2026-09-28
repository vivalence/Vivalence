<script>
  let { label = null, tone = "plain", size = "key", latched = false, led = false, muted = false, square = false, wide = false, stack = false, disabled = false, hold = 0, title = null, type = "button", onclick, onhold, onpress, onrelease, children } = $props();

  let holding = $state(false);
  let pressed = false;
  let fired = false;
  let timer = null;

  const press = (event) => {
    fired = false;
    if (disabled) return;
    pressed = true;
    onpress?.(event);
    if (!hold) return;
    holding = true;
    timer = setTimeout(() => {
      fired = true;
      holding = false;
      onhold?.();
    }, hold);
  };

  const lift = (event) => {
    clearTimeout(timer);
    holding = false;
    if (!pressed) return;
    pressed = false;
    onrelease?.(event);
  };

  const click = (event) => {
    if (disabled || fired) return;
    onclick?.(event);
  };
</script>

<button
  class="key {tone} {size}"
  class:latched
  class:muted
  class:square
  class:wide
  class:stack
  class:holding
  style:--key-hold="{hold}ms"
  {disabled}
  {title}
  {type}
  onclick={click}
  onpointerdown={press}
  onpointerup={lift}
  onpointerleave={lift}
  onpointercancel={lift}>
  {#if hold && tone === "negative"}<span class="fill"></span>{/if}
  {#if led}<span class="led"></span>{/if}
  <span class="face">{#if children}{@render children()}{:else}{label}{/if}</span>
</button>

<style>
  .key {
    position: relative;
    overflow: hidden;
    flex: none;
    height: var(--size-key);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 12px;
    border: none;
    border-radius: var(--shape-radius-key);
    background: var(--control-contrast);
    color: var(--control-on);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary), 0 var(--size-depth) 0 var(--boundary);
    font: inherit;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition: transform 0.07s;
  }
  .face {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }
  .key:hover {
    background: var(--control-contrast-hover);
  }
  .key:active,
  .key.latched {
    background: var(--control-contrast-pressed);
    color: var(--control-on-pressed);
    box-shadow: var(--shape-sunk), 0 0 0 var(--size-ring) var(--boundary);
    transform: translateY(var(--size-depth));
  }
  .key.muted {
    color: var(--control-on-muted);
  }
  .key.row {
    height: var(--size-row);
    padding: 0 10px;
  }
  .key.field {
    height: var(--size-field);
  }
  .key.mini {
    height: 22px;
    gap: 4px;
    padding: 0 6px;
    border-radius: var(--shape-radius-xs);
  }
  .key.square {
    width: var(--size-row);
    padding: 0;
  }
  .key.mini.square {
    width: 22px;
  }
  .key.bone {
    height: 31px;
    min-width: 31px;
    padding: 0 8px;
  }
  .key.bone .face {
    gap: 6px;
  }
  .key.bone.stack {
    width: 31px;
    height: auto;
    min-height: 31px;
    padding: 7px 0;
  }
  .key.bone.stack .face {
    flex-direction: column;
  }
  .key.wide {
    width: 100%;
  }
  .key.primary {
    background: var(--signal-primary);
    color: var(--signal-primary-on);
    box-shadow: 0 var(--size-depth) 0 var(--shadow);
  }
  .key.primary:hover {
    background: var(--signal-primary);
    filter: brightness(1.06);
  }
  .key.primary:active {
    box-shadow: var(--shape-sunk);
  }
  .key.negative {
    box-shadow: 0 0 0 var(--size-ring) var(--signal-negative), 0 var(--size-depth) 0 var(--signal-negative);
  }
  .key.negative:active {
    background: var(--control-contrast);
    box-shadow: var(--shape-sunk), 0 0 0 var(--size-ring) var(--signal-negative);
  }
  .key.ghost {
    background: transparent;
    color: var(--text-light);
    box-shadow: none;
  }
  .key.ghost:hover {
    background: var(--control-selected);
    color: var(--signal-primary-ink);
  }
  .key.ghost:active,
  .key.ghost.latched {
    background: var(--control-selected);
    color: var(--signal-primary-ink);
    box-shadow: none;
    transform: none;
  }
  .key:disabled {
    opacity: var(--text-disabled);
    cursor: default;
    transform: none;
  }
  .fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: 0;
    background: var(--signal-negative-tint);
    transition: width 0.15s;
  }
  .key.holding .fill {
    width: 100%;
    transition: width var(--key-hold) linear;
  }
  .led {
    position: relative;
    flex: none;
    width: 5px;
    height: 5px;
    border-radius: var(--shape-radius-full);
    background: var(--control-divider);
  }
  .key.latched .led {
    background: var(--signal-primary);
    box-shadow: 0 0 6px var(--signal-primary);
  }
  @media (pointer: coarse) {
    .key {
      min-height: 44px;
    }
    .key.square {
      min-width: 44px;
    }
  }
</style>
