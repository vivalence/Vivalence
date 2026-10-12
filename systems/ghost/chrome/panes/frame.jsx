import { createSignal, from, onCleanup, onMount, Show } from "solid-js";
import { useRenderer } from "@opentui/solid";
import { belt, is } from "@vivalence/typology";
import { Empty, JsonTree, usePalette } from "@vivalence/sheets";

const applied = (buffer) =>
  is.object(buffer.mode) && buffer.mode.implements("APPLICATION") ? from(buffer.mode.$application) : () => null;

const Mounted = (props) => {
  const palette = usePalette();
  const renderer = useRenderer();
  const [fault, setFault] = createSignal(null);
  let element;
  let handle = null;
  onMount(() => {
    props.bundle
      .load(props.accept)
      .then((module) => (handle = module.default(element, props.terminal, { renderer, palette })))
      .catch((error) => setFault(error.message));
  });
  onCleanup(() => handle !== null && handle.destroy());
  return (
    <box style={{ flexDirection: "column", flexGrow: 1 }}>
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
  const terminal = from(props.client.terminals.$active);
  const buffer = from(belt.atom.chain(props.client.terminals.$active, "$buffer"));
  return (
    <box style={{ flexDirection: "column", flexGrow: 1, paddingLeft: 1, paddingRight: 1 }}>
      <Show when={buffer()} keyed fallback={<Empty>no buffer</Empty>}>
        {(held) => {
          const bundle = from(held.$bundle);
          const application = applied(held);
          const offered = () => (bundle() !== null ? bundle() : application() === null ? null : application().bundle);
          return (
            <box style={{ flexDirection: "column", flexGrow: 1 }}>
              <text fg={palette.textMuted}>{`buffer #${held.id}`}</text>
              <Show when={offered() !== null && offered().negotiate(props.accept) !== null ? offered() : null} keyed fallback={<Floor buffer={held} />}>
                {(chosen) => <Mounted terminal={terminal()} bundle={chosen} accept={props.accept} />}
              </Show>
            </box>
          );
        }}
      </Show>
    </box>
  );
}
