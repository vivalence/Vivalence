import { createEffect, For } from "solid-js";

export const KEYS = { y: "onApprove", n: "onSkip", e: "onEdit" };
const ACTS = [
  ["y", "approve", "onApprove"],
  ["n", "skip", "onSkip"],
  ["e", "edit", "onEdit"],
];

export const Consent = (props) => {
  const act = (name) => (event) => props[name] && props[name](props.call, event);
  const keydown = (event) => {
    if (!(event.key in KEYS)) return;
    event.preventDefault();
    act(KEYS[event.key])(event);
  };
  let element;
  createEffect(() => {
    if (props.focus && document.activeElement !== element) element.focus({ preventScroll: true });
  });
  return (
    <div
      ref={element}
      class="consent"
      role="group"
      aria-label="consent"
      tabindex="0"
      data-focus={props["data-focus"]}
      onKeyDown={keydown}>
      <span class="q">?</span>
      <span>approve</span>
      <span class="call">
        {props.call.name} {props.call.argument}
      </span>
      <span class="keys">
        <For each={ACTS}>
          {([key, label, name]) => (
            <button onClick={act(name)}>
              <b>{key}</b>
              {label}
            </button>
          )}
        </For>
      </span>
    </div>
  );
};
