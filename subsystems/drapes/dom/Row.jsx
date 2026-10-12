import { Show } from "solid-js";

const pressed = (props) => (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  props.onClick(event);
};

export const Row = (props) => (
  <Show
    when={props.onClick}
    fallback={
      <div class="kit-row" classList={{ "kit-row-selected": props.selected === true }} title={props.title}>
        {props.children}
      </div>
    }>
    <div
      class="kit-row kit-row-click"
      classList={{ "kit-row-selected": props.selected === true }}
      role="button"
      tabindex="0"
      title={props.title}
      onClick={(event) => props.onClick(event)}
      onKeyDown={pressed(props)}>
      {props.children}
    </div>
  </Show>
);

export const style = `
.kit-row {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  height: var(--size-row);
  padding: 0 8px;
  border-radius: var(--shape-radius-key);
  font-family: var(--font-family-code);
  font-size: var(--size-type-2xs);
  color: var(--text-ink);
}
.kit-row-click {
  cursor: pointer;
}
.kit-row-click:hover,
.kit-row-selected {
  background: var(--control-selected);
}
`;
