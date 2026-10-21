import { createEffect, mergeProps } from "solid-js";

export const LABELS = { turn: "composer", line: "repl line", filter: "filter" };

export const Field = (props) => {
  const held = mergeProps({ value: "", placeholder: "", kind: "turn", focus: false, dictating: false, rows: 1 }, props);
  let element;
  let typing = false;
  const repl = () => held.value.startsWith("/");
  const keydown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (held.onSubmit) held.onSubmit(element.value);
  };
  const input = (event) => {
    typing = true;
    if (held.onInput) held.onInput(event.target.value);
  };
  createEffect(() => {
    const value = held.value;
    const typed = typing;
    typing = false;
    if (!held.focus || typed) return;
    if (element.ownerDocument.activeElement !== element) element.focus();
    element.setSelectionRange(value.length, value.length);
  });
  return (
    <div class="field" classList={{ focus: held.focus, dict: held.dictating, repl: repl() }}>
      <span class="pcw">{held.lead}</span>
      <textarea
        ref={element}
        id={held.id}
        classList={{ repl: repl() }}
        rows={held.rows}
        spellcheck={false}
        value={held.value}
        placeholder={held.placeholder}
        aria-label={LABELS[held.kind]}
        onInput={input}
        onFocus={() => held.onFocus && held.onFocus()}
        onKeyDown={keydown}
      />
      <span class="fk">{held.children}</span>
    </div>
  );
};
