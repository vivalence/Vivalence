import { createEffect, createMemo, createResource, For, from, onCleanup, Show } from "solid-js";
import { useRenderer } from "@opentui/solid";
import { atom } from "@vivalence/typology";
import * as ambient from "../../ambient/index.js";
import { SETTLED } from "../../../../gestalten/shard/host.js";
import * as widgets from "../../widgets/index.js";
import * as belt from "../../../../gestalten/belt/index.js";

const named = (buffer) => buffer.trait.LABELED.name;

export const KEYS = {
  frame: { label: "⇥ keys to the dock", signal: "/focus dock" },
  elsewhere: { label: "⇥ keys to the frame", signal: "/focus frame" },
};

export const keyed = (focus) => (focus === "frame.surface" ? KEYS.frame : KEYS.elsewhere);


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
    return widgets.buffer.frame(props.buffer, props.surfaces);
  };
  return (
    <box style={{ flexDirection: "row", height: 1, paddingLeft: 1 }}>
      <text fg={props.palette.textStrong} style={{ flexShrink: 0 }}>
        <b>◆ artifact</b>
      </text>
      <text wrapMode="none" fg={props.palette.textMuted} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>{` · ${widgets.entity.moded(props.buffer)}`}</text>
      <Show when={props.surface !== undefined}>
        <text cursor="pointer" fg={props.palette.textMuted} style={{ flexShrink: 0 }} onMouseUp={() => terminal.repl.dispatch(keyed(focus()).signal).catch(faulted)}>
          {`${keyed(focus()).label}  `}
        </text>
      </Show>
      <Show when={props.surfaces.length > 0}>
        <text
          cursor="pointer"
          fg={props.palette.textInk}
          bg={props.palette.planeSunk}
          style={{ flexShrink: 0 }}
          onMouseUp={() => terminal.repl.dispatch(`/frame/set ${widgets.buffer.following(current(), props.surfaces)}`).catch(faulted)}
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
  const host = props.buffer.mode.daemon === null ? terminal.client.runtime : props.buffer.mode.daemon;
  const status = from(host.$status);
  const files = from(terminal.client.runtime.entities.file.$entities);
  const fingerprint = () => {
    files();
    return props.surface.files.find((file) => file.path === props.surface.entry)?.integrity;
  };
  const [module] = createResource(
    () => status().code === "HEALTHY" && [props.surface, fingerprint()],
    ([surface]) => belt.surface.load(surface, terminal.client.runtime),
  );
  const loaded = createMemo(() => (module.error === undefined ? module.latest : undefined));
  let element;
  createEffect(() => {
    if (module.error !== undefined) terminal.controller.stdout.fault(module.error);
  });
  createEffect(() => {
    if (loaded() === undefined) return;
    const handle = loaded().default(element, {
      terminal,
      buffer: props.buffer,
      renderer,
      palette: props.palette,
      focused: props.focused,
      display: app.display,
    });
    onCleanup(() => handle.destroy());
  });
  return (
    <box style={{ flexDirection: "column", flexGrow: 1, minHeight: 0, overflow: "hidden" }}>
      <Show when={module.error !== undefined}>
        <text fg={props.palette.signalNegativeInk} style={{ paddingLeft: 1 }}>{`✕ ${module.error.message}`}</text>
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
  const [settled] = createResource(
    () => props.buffer,
    async (buffer) => {
      const status = await atom.until(
        buffer.mode.daemon === null ? terminal.client.runtime.$status : buffer.mode.daemon.$status,
        (held) => SETTLED.includes(held.code),
        terminal.controller.abort.signal,
      );
      if (status.code === "ERROR") throw status.error;
      return status;
    },
  );
  const pool = from(
    widgets.buffer.candidates(props.buffer, terminal.client.runtime.entities.file.$entities),
  );
  const listed = () => widgets.buffer.framed(pool());
  const surface = () => {
    trait();
    return widgets.buffer.frame(props.buffer, listed());
  };
  return (
    <>
      <Head palette={props.palette} buffer={props.buffer} surfaces={listed()} surface={surface()} />
      <box style={{ height: 1, flexShrink: 0, border: ["top"], borderColor: props.palette.divider }} />
      <Show when={settled.state === "errored"}>
        <text fg={props.palette.signalNegativeInk} style={{ paddingLeft: 1 }}>{`✕ ${settled.error.message}`}</text>
      </Show>
      <Show when={surface()} keyed fallback={<Floor palette={props.palette} buffer={props.buffer} />}>
        {(held) => <Mounted palette={props.palette} buffer={props.buffer} surface={held} focused={() => focus() === "frame.surface"} />}
      </Show>
    </>
  );
}

export function Frame(props) {
  const buffer = from(ambient.terminal.consume().$buffer);
  return (
    <box style={{ flexDirection: "column", flexGrow: 1, minHeight: 0, overflow: "hidden", backgroundColor: props.palette.plane }}>
      <Show when={buffer()} keyed fallback={<Empty palette={props.palette} />}>
        {(held) => <Framed palette={props.palette} buffer={held} />}
      </Show>
    </box>
  );
}
