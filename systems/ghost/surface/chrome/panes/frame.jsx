import { createSignal, from, onCleanup, onMount, Show } from "solid-js";
import { useRenderer } from "@opentui/solid";
import { belt, is } from "@vivalence/typology";
import { JsonTree } from "../views/JsonTree.jsx";
import { usePalette } from "../palette.js";

const applied = (buffer) => (is.object(buffer.mode) && buffer.mode.implements("APPLICATION") ? from(buffer.mode.$application) : () => null);

const FOCUS = { true: "⇥ keys to the frame", false: "⇥ keys to the dock" };

const Mounted = (props) => {
  const palette = usePalette();
  const renderer = useRenderer();
  const [fault, setFault] = createSignal(null);
  const [focused, setFocused] = createSignal(true);
  let element;
  let handle = null;
  const toggle = (key) => {
    if (key.name !== "tab" || key.defaultPrevented) return;
    key.preventDefault();
    key.stopPropagation();
    setFocused(!focused());
  };
  onMount(() => {
    renderer.keyInput.prependListener("keypress", toggle);
    props.buffer.mount();
    props.bundle
      .load(props.accept)
      .then((module) => (handle = module.default(element, { terminal: props.terminal, mode: props.buffer.mode, thread: props.terminal.thread, buffer: props.buffer, renderer, palette, dispatch: props.dispatch, focused })))
      .catch((error) => setFault(error.message));
  });
  onCleanup(() => {
    renderer.keyInput.off("keypress", toggle);
    if (handle !== null) handle.destroy();
    props.buffer.unmount();
  });
  return (
    <box style={{ flexDirection: "column", flexGrow: 1 }}>
      <text fg={focused() ? palette.signalPrimary : palette.textMuted}>{FOCUS[focused()]}</text>
      <Show when={fault() !== null}>
        <text fg={palette.signalNegative}>{`✕ ${fault()}`}</text>
      </Show>
      <box ref={element} style={{ flexDirection: "column", flexGrow: 1 }} />
    </box>
  );
};

const Floor = (props) => {
  const data = from(props.buffer.$data);
  return <JsonTree data={data()} />;
};

export function Frame(props) {
  const palette = usePalette();
  const terminal = from(props.client.$active);
  const buffer = from(belt.atom.chain(props.client.$active, "$buffer"));
  return (
    <box style={{ flexDirection: "column", flexGrow: 1, paddingLeft: 1, paddingRight: 1 }}>
      <Show when={buffer()} keyed fallback={<text fg={palette.textMuted}>no buffer</text>}>
        {(held) => {
          const bundle = from(held.$bundle);
          const application = applied(held);
          const offered = () => (application() === null ? null : bundle() !== null ? bundle().withUrl(application().url) : application().bundle);
          return (
            <box style={{ flexDirection: "column", flexGrow: 1 }}>
              <text fg={palette.textMuted}>{`buffer #${held.id}`}</text>
              <Show when={offered() !== null && offered().negotiate(props.accept) !== null ? offered() : null} keyed fallback={<Floor buffer={held} />}>
                {(chosen) => <Mounted terminal={terminal()} buffer={held} bundle={chosen} accept={props.accept} dispatch={(line) => props.client.dispatch(line)} />}
              </Show>
            </box>
          );
        }}
      </Show>
    </box>
  );
}
