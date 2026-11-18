import { createEffect, For } from "solid-js";
import { parts } from "@vivalence/dapper";

export const Consent = (props) => {
  const act = (name) => (event) => props[name] && props[name](props.call, event);
  const keydown = (event) => {
    const hit = parts.consent.ACTS.find(([key]) => key === event.key);
    if (hit === undefined) return;
    event.preventDefault();
    act(hit[2])(event);
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
        <For each={parts.consent.ACTS}>
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
