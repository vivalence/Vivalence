import { createResource, createSignal, For, from, onCleanup, onMount, Show } from "solid-js";
import { useRenderer } from "@opentui/solid";
import { atom, is } from "@vivalence/typology";
import * as ambient from "../../ambient/index.js";
import { SETTLED } from "../../../../gestalten/shard/host.js";
import * as widgets from "../../widgets/index.js";
import * as belt from "../../../../gestalten/belt/index.js";

const named = (buffer) => buffer.trait.LABELED.name;

export const KEYS = {
  frame: { label: "⇥ keys to the dock", signal: "/focus composer" },
  elsewhere: { label: "⇥ keys to the frame", signal: "/focus frame" },
};

export const keyed = (focus) => (focus === "frame" ? KEYS.frame : KEYS.elsewhere);


function Hint(props) {
  const terminal = ambient.terminal.consume();
  return (
    <text
      cursor={props.buffer === undefined ? undefined : "pointer"}
      fg={props.palette.signalPrimaryInk}
      onMouseUp={props.buffer === undefined ? undefined : () => terminal.repl.dispatch(`/buffer "${named(props.buffer)}"`).catch((error) => terminal.controller.stdout.fault(error))}
    >
      {props.buffer === undefined ? "/buffer ‹label›" : `/buffer ${named(props.buffer)}`}
    </text>
  );
}

function Empty(props) {
  const thread = from(ambient.terminal.consume().$thread);
  return (
    <box style={{ flexDirection: "column", flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
      <text fg={props.palette.textMuted}>{"◇  no buffer in the frame"}</text>
      <text>{" "}</text>
      <Show when={thread()} keyed fallback={<Hint palette={props.palette} buffer={undefined} />}>
        {(seated) => {
          const buffers = from(seated.$buffers);
          return <Hint palette={props.palette} buffer={buffers()[0]} />;
        }}
      </Show>
    </box>
  );
}

function Head(props) {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const focus = from(app.bridge.$focus);
  const trait = from(props.buffer.$trait);
  const faulted = (error) => terminal.controller.stdout.fault(error);
  const current = () => {
    trait();
    return widgets.buffer.frame(props.buffer, props.views);
  };
  return (
    <box style={{ flexDirection: "row", height: 1, paddingLeft: 1 }}>
      <text fg={props.palette.textStrong} style={{ flexShrink: 0 }}>
        <b>◆ artifact</b>
      </text>
      <text wrapMode="none" fg={props.palette.textMuted} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>{` · ${widgets.entity.moded(props.buffer)}`}</text>
      <Show when={props.view !== undefined}>
        <text cursor="pointer" fg={props.palette.textMuted} style={{ flexShrink: 0 }} onMouseUp={() => terminal.repl.dispatch(keyed(focus()).signal).catch(faulted)}>
          {`${keyed(focus()).label}  `}
        </text>
      </Show>
      <Show when={props.views.length > 0}>
        <text
          cursor="pointer"
          fg={props.palette.textInk}
          bg={props.palette.surfaceSunk}
          style={{ flexShrink: 0 }}
          onMouseUp={() => terminal.repl.dispatch(`/frame/set ${widgets.buffer.following(current(), props.views)}`).catch(faulted)}
        >
          {` ${current().slug} ▾ `}
        </text>
      </Show>
      <text cursor="pointer" fg={props.palette.textMuted} style={{ flexShrink: 0 }} onMouseUp={() => terminal.repl.dispatch("/buffer/close").catch(faulted)}>
        {"  ✕ "}
      </text>
    </box>
  );
}

function Floor(props) {
  const data = from(props.buffer.$data);
  return (
    <scrollbox verticalScrollbarOptions={{ visible: false }} style={{ flexGrow: 1, minHeight: 0, paddingLeft: 2 }}>
      <For each={JSON.stringify(data(), null, 1).split("\n")}>{(row) => <text wrapMode="none" fg={props.palette.textLink} style={{ flexShrink: 0 }}>{row}</text>}</For>
    </scrollbox>
  );
}

export function Mounted(props) {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const renderer = useRenderer();
  const [fault, setFault] = createSignal(null);
  let element;
  onMount(() => {
    const mounted = belt.view
      .load(props.view, terminal.client.runtime.attach)
      .then((module) => module.default(element, { terminal, buffer: props.buffer, renderer, palette: props.palette, focused: props.focused, display: app.display }));
    mounted.catch((error) => {
      setFault(error.message);
      terminal.controller.stdout.fault(error);
    });
    onCleanup(() => mounted.then((handle) => handle.destroy(), () => undefined));
  });
  return (
    <box style={{ flexDirection: "column", flexGrow: 1, minHeight: 0, overflow: "hidden" }}>
      <Show when={fault() !== null}>
        <text fg={props.palette.signalNegativeInk} style={{ paddingLeft: 1 }}>{`✕ ${fault()}`}</text>
      </Show>
      <box ref={element} style={{ flexDirection: "column", flexGrow: 1, minHeight: 0, overflow: "hidden" }} />
    </box>
  );
}

function Framed(props) {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const focus = from(app.bridge.$focus);
  const trait = from(props.buffer.$trait);
  const [views] = createResource(
    () => props.buffer,
    async (buffer) => {
      if (is.object(buffer.mode)) {
        const status = await atom.until(buffer.mode.host.$status, (held) => SETTLED.includes(held.code), terminal.controller.abort.signal);
        if (status.code === "ERROR") throw status.error;
      }
      return widgets.buffer.framed(buffer, terminal.client.runtime.attach);
    },
  );
  const listed = () => (views.state === "ready" ? views() : []);
  const view = () => {
    trait();
    return widgets.buffer.frame(props.buffer, listed());
  };
  return (
    <>
      <Head palette={props.palette} buffer={props.buffer} views={listed()} view={view()} />
      <box style={{ height: 1, flexShrink: 0, border: ["top"], borderColor: props.palette.divider }} />
      <Show when={views.state === "errored"}>
        <text fg={props.palette.signalNegativeInk} style={{ paddingLeft: 1 }}>{`✕ ${views.error.message}`}</text>
      </Show>
      <Show when={view()} keyed fallback={<Floor palette={props.palette} buffer={props.buffer} />}>
        {(held) => <Mounted palette={props.palette} buffer={props.buffer} view={held} focused={() => focus() === "frame"} />}
      </Show>
    </>
  );
}

export function Frame(props) {
  const buffer = from(ambient.terminal.consume().$buffer);
  return (
    <box style={{ flexDirection: "column", flexGrow: 1, minHeight: 0, overflow: "hidden", backgroundColor: props.palette.surface }}>
      <Show when={buffer()} keyed fallback={<Empty palette={props.palette} />}>
        {(held) => <Framed palette={props.palette} buffer={held} />}
      </Show>
    </box>
  );
}
