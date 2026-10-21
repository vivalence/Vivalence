import { createSignal, For, onCleanup, onMount } from "solid-js";
import { _render, createComponent, RendererContext } from "@opentui/solid";

const shown = (field, value) => (field.kind === "password" ? "•".repeat(value.length) : value);

const Form = (props) => {
  const fields = props.pages.flatMap((page) => page.fields.map((field) => ({ ...field, page: page.title })));
  const [at, setAt] = createSignal(0);
  const [values, setValues] = createSignal(Object.fromEntries(fields.map((field) => [field.name, String(field.initial ?? "")])));

  const field = () => fields[at()];
  const write = (value) => setValues({ ...values(), [field().name]: value });
  const cycle = (step) => {
    const options = field().options;
    const now = options.findIndex((option) => option.value === values()[field().name]);
    write(options[(now + step + options.length) % options.length].value);
  };

  const keys = (key) => {
    if (key.name === "escape") return props.answer({ aborted: true });
    if (key.name === "return") {
      if (at() === fields.length - 1) return props.answer({ action: props.actions[0], values: values() });
      return setAt(at() + 1);
    }
    if (key.name === "up" || (key.name === "tab" && key.shift)) return setAt(Math.max(0, at() - 1));
    if (key.name === "down" || key.name === "tab") return setAt(Math.min(fields.length - 1, at() + 1));
    if (field().kind === "select") {
      if (key.name === "left") cycle(-1);
      if (key.name === "right" || key.name === "space") cycle(1);
      return;
    }
    const value = values()[field().name];
    if (key.name === "backspace") return write(value.slice(0, -1));
    if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) write(value + key.sequence);
  };
  onMount(() => props.renderer.keyInput.prependListener("keypress", keys));
  onCleanup(() => props.renderer.keyInput.off("keypress", keys));

  return (
    <box style={{ flexDirection: "column" }}>
      <text>{props.title}</text>
      <For each={fields}>
        {(each, index) => (
          <box style={{ flexDirection: "column" }}>
            <text>{`${index() === at() ? "›" : " "} ${each.label}: ${shown(each, values()[each.name])}`}</text>
            {each.hint && index() === at() ? <text>{`    ${each.hint}`}</text> : null}
          </box>
        )}
      </For>
      <text>{`enter → ${at() === fields.length - 1 ? props.actions[0] : "next"} · esc → ${props.actions.at(-1)}`}</text>
    </box>
  );
};

export default (element, props) => {
  const dispose = _render(
    () =>
      createComponent(RendererContext.Provider, {
        value: props.renderer,
        get children() {
          return createComponent(Form, props);
        },
      }),
    element,
  );
  return {
    destroy: () => {
      dispose();
      for (const child of element.getChildren()) child.destroyRecursively();
    },
  };
};
