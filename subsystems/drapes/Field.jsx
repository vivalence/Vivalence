import { createEffect, mergeProps } from "solid-js";

export const LABELS = { turn: "dock textarea", repl: "repl input", filter: "filter" };

export const Field = (props) => {
  const held = mergeProps({ value: "", placeholder: "", kind: "turn", focus: false, dictating: false, rows: 1 }, props);
  let element;
  createEffect(() => {
    if (held.focus && document.activeElement !== element) element.focus({ preventScroll: true });
  });
  const repl = () => held.value.startsWith("/");
  const keydown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (held.onSubmit) held.onSubmit(element.value);
  };
  const input = (event) => {
    if (held.onInput) held.onInput(event.target.value);
  };
  return (
    <div class="field" classList={{ focus: held.focus, dict: held.dictating, repl: repl() }}>
      <span class="pcw">{held.lead}</span>
      <textarea
        ref={element}
        id={held.id}
        data-focus={held["data-focus"]}
        classList={{ repl: repl() }}
        rows={held.rows}
        spellcheck={false}
        value={held.value}
        placeholder={held.placeholder}
        aria-label={LABELS[held.kind]}
        onInput={input}
        onKeyDown={keydown}
      />
      <span class="fk">{held.children}</span>
    </div>
  );
};
