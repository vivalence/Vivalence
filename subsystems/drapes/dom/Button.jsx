import { mergeProps, Show } from "solid-js";

export const Button = (props) => {
  const held = mergeProps(
    { tone: "plain", size: "key", type: "button", latched: false, led: false, muted: false, square: false, wide: false },
    props,
  );
  return (
    <button
      class={`kit-button kit-button-${held.tone} kit-button-${held.size}`}
      classList={{
        "kit-button-latched": held.latched,
        "kit-button-muted": held.muted,
        "kit-button-square": held.square,
        "kit-button-wide": held.wide,
      }}
      type={held.type}
      title={held.title}
      onClick={held.onClick}>
      <Show when={held.led}>
        <span class="kit-button-led" />
      </Show>
      <span class="kit-button-face">
        {held.label}
        {held.children}
      </span>
    </button>
  );
};

export const style = `
.kit-button {
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
.kit-button-face {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
.kit-button:hover {
  background: var(--control-contrast-hover);
}
.kit-button:active,
.kit-button.kit-button-latched {
  background: var(--control-contrast-pressed);
  color: var(--control-on-pressed);
  box-shadow: var(--shape-sunk), 0 0 0 var(--size-ring) var(--boundary);
  transform: translateY(var(--size-depth));
}
.kit-button.kit-button-muted {
  color: var(--control-on-muted);
}
.kit-button.kit-button-row {
  height: var(--size-row);
  padding: 0 10px;
}
.kit-button.kit-button-field {
  height: var(--size-field);
}
.kit-button.kit-button-mini {
  height: 22px;
  gap: 4px;
  padding: 0 6px;
  border-radius: var(--shape-radius-xs);
}
.kit-button.kit-button-square {
  width: var(--size-row);
  padding: 0;
}
.kit-button.kit-button-mini.kit-button-square {
  width: 22px;
}
.kit-button.kit-button-wide {
  width: 100%;
}
.kit-button.kit-button-primary {
  background: var(--signal-primary);
  color: var(--signal-primary-on);
  box-shadow: 0 var(--size-depth) 0 var(--shadow);
}
.kit-button.kit-button-primary:hover {
  filter: brightness(1.06);
}
.kit-button.kit-button-primary:active {
  box-shadow: var(--shape-sunk);
}
.kit-button.kit-button-negative {
  box-shadow: 0 0 0 var(--size-ring) var(--signal-negative), 0 var(--size-depth) 0 var(--signal-negative);
}
.kit-button.kit-button-ghost {
  background: transparent;
  color: var(--text-light);
  box-shadow: none;
}
.kit-button.kit-button-ghost:hover,
.kit-button.kit-button-ghost.kit-button-latched {
  background: var(--control-selected);
  color: var(--signal-primary-ink);
  box-shadow: none;
  transform: none;
}
.kit-button-led {
  position: relative;
  flex: none;
  width: 5px;
  height: 5px;
  border-radius: var(--shape-radius-full);
  background: var(--control-divider);
}
.kit-button-latched .kit-button-led {
  background: var(--signal-primary);
  box-shadow: 0 0 6px var(--signal-primary);
}
@media (pointer: coarse) {
  .kit-button {
    min-height: 44px;
  }
  .kit-button.kit-button-square {
    min-width: 44px;
  }
}
`;
