import { Show } from "solid-js";
import { Spinner } from "./Spinner.jsx";

export const Empty = (props) => (
  <div class="kit-empty" classList={{ "kit-empty-dashed": props.dashed === true }}>
    <Show when={props.spinner === true}>
      <Spinner />
    </Show>
    <span
      class="kit-empty-verb"
      classList={{ "kit-empty-warning": props.tone === "warning", "kit-empty-negative": props.tone === "negative" }}>
      {props.verb}
    </span>
    <Show when={props.trace}>
      <span class="kit-empty-trace">{props.trace}</span>
    </Show>
  </div>
);

export const style = `
.kit-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 10px;
  text-align: center;
  min-width: 0;
  overflow-wrap: anywhere;
  font-family: var(--font-family-code);
  user-select: none;
}
.kit-empty-dashed {
  background: var(--surface-sunk);
  box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
  border-radius: var(--shape-radius-card);
}
.kit-empty-verb {
  font-size: var(--size-type-2xs);
  font-weight: 600;
  letter-spacing: var(--shape-label-track);
  text-transform: var(--shape-label-case);
  color: var(--text-light);
}
.kit-empty-verb.kit-empty-warning {
  color: var(--signal-caution-ink);
}
.kit-empty-verb.kit-empty-negative {
  color: var(--signal-negative-ink);
}
.kit-empty-trace {
  font-size: var(--size-type-2xs);
  color: var(--text-muted);
  line-height: var(--size-leading-loose);
}
`;
