import { createEffect, createMemo, createResource, from, onCleanup, onMount, Show } from "solid-js";
import * as parts from "@vivalence/drapes/solid";
import { bytes, href, load } from "./surface.js";
import { named } from "../../panels/sidebar/sections.js";

export const Fault = (props) => (
  <div class="empty" role="alert">
    <div class="sign neg">!</div>
    <div class="neg">{props.message}</div>
  </div>
);

const healthy = (props) => {
  const host = props.buffer.mode.daemon === null ? props.terminal.client.runtime : props.buffer.mode.daemon;
  const status = from(host.$status);
  return () => status().code === "HEALTHY";
};

const Mount = (props) => {
  const settled = healthy(props);
  const files = from(props.terminal.client.runtime.entities.file.$entities);
  const fingerprint = () => {
    files();
    return props.surface.files.find((file) => file.path === props.surface.entry)?.integrity;
  };
  const [module] = createResource(
    () => settled() && [props.surface, fingerprint()],
    ([surface]) => load(surface, props.terminal.client.runtime),
  );
  const loaded = createMemo(() => (module.error === undefined ? module.latest : undefined));
  let element;
  onMount(() => props.buffer.attach());
  onCleanup(() => props.buffer.detach());
  createEffect(() => {
    if (loaded() === undefined) return;
    const handle = loaded().default(element, {
      terminal: props.terminal,
      buffer: props.buffer,
      skin: props.skin,
    });
    onCleanup(() => handle.destroy());
  });
  return (
    <div class="mounted">
      <Show when={module.error !== undefined}>
        <Fault message={module.error.message} />
      </Show>
      <div ref={element} class="mount" />
    </div>
  );
};

export const Mounted = (props) => {
  const trait = from(props.buffer.$trait);
  const surface = () => {
    trait();
    return props.picked(props.buffer, props.surfaces);
  };
  return (
    <Show when={surface()} keyed>
      {(held) => <Mount terminal={props.terminal} buffer={props.buffer} surface={held} skin={props.skin} />}
    </Show>
  );
};

export const SOURCES = [
  [(buffer) => buffer.files.length > 0, (buffer, runtime) => bytes(buffer.files[0], runtime)],
  [() => true, (buffer) => Promise.resolve(JSON.stringify(buffer.data, null, 1))],
];

const sourced = (props) => {
  const settled = healthy(props);
  return createResource(
    () => settled() && props.buffer,
    (buffer) => SOURCES.find(([test]) => test(buffer))[1](buffer, props.terminal.client.runtime),
  )[0];
};

export const Markdown = (props) => {
  const text = sourced(props);
  return (
    <Show when={text.error} fallback={<parts.Markdown text={text() === undefined ? "" : text()} />}>
      <Fault message={text.error.message} />
    </Show>
  );
};

export const Html = (props) => {
  const text = sourced(props);
  return (
    <Show when={text.error} fallback={<parts.Html html={text() === undefined ? "" : text()} title={named(props.buffer)} />}>
      <Fault message={text.error.message} />
    </Show>
  );
};

export const JsonTree = (props) => {
  const data = from(props.buffer.$data);
  return <parts.Yield value={data() === undefined ? {} : data()} style={parts.YIELD_INSET} />;
};

export const Image = (props) => <parts.Image src={href(props.buffer.files[0], props.terminal.client.runtime)} alt={named(props.buffer)} />;

export const Summary = (props) => (
  <parts.Row key="▸" name={named(props.buffer)} onPick={() => props.terminal.repl.dispatch(`/buffer "${named(props.buffer)}"`).catch((error) => props.terminal.controller.stdout.fault(error))} />
);
