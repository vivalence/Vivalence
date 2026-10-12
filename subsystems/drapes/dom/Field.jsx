import { mergeProps, Show } from "solid-js";
import { Pip } from "./Pip.jsx";

export const Field = (props) => {
  const held = mergeProps({ width: 42, pip: false, pipTone: "primary" }, props);
  return (
    <label class="kit-field">
      <Show when={held.label}>
        <span class="kit-field-label" style={{ "--field-label-width": `${held.width}px` }}>
          {held.label}
        </span>
      </Show>
      <span class="kit-field-control">{held.children}</span>
      <Show when={held.pip}>
        <Pip size={7} tone={held.pipTone} pulse />
      </Show>
      <Show when={held.trailing}>
        <span class="kit-field-trailing">{held.trailing}</span>
      </Show>
    </label>
  );
};

export const style = `
.kit-field {
  display: flex;
  align-items: center;
  gap: 11px;
}
.kit-field-label {
  width: var(--field-label-width);
  flex: none;
  font-family: var(--font-family-code);
  font-size: var(--size-type-2xs);
  font-weight: 600;
  letter-spacing: var(--shape-label-track);
  text-transform: var(--shape-label-case);
  color: var(--text-light);
}
.kit-field-control {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}
.kit-field-trailing {
  flex: none;
  display: inline-flex;
  align-items: center;
}
.kit-field-input {
  height: var(--size-field);
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 0 10px;
  border: none;
  border-radius: var(--shape-radius-field);
  background: var(--control-field);
  color: var(--text-strong);
  box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
  outline: none;
  font: inherit;
  font-family: var(--font-family-code);
  font-size: var(--size-type-xs);
  caret-color: var(--control-field-caret);
}
.kit-field-input::placeholder {
  color: var(--control-field-placeholder);
  opacity: 1;
}
.kit-field-input:focus {
  box-shadow: inset 0 0 0 calc(var(--size-ring) * 1.5) var(--control-focus);
}
`;
