import { createResource, from, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import * as parts from "@vivalence/drapes/parts";
import * as ambient from "../../ambient/index.js";
import { cell, cells, Fault, renderer, surfaced } from "../../widgets/buffer/index.js";
import { named, reference, short } from "../sidebar/sections.js";

export const View = (props) => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const [views] = createResource(
    () => props.buffer,
    (buffer) => props.listed(buffer, app.client.runtime.attach),
  );
  return (
    <Show
      when={views.error}
      fallback={
        <Show when={views()} keyed fallback={<div class="ab"><div class="sub">{named(props.buffer)}</div></div>}>
          {(rows) => <Dynamic component={renderer(props.buffer, rows)} terminal={terminal} buffer={props.buffer} views={rows} picked={props.picked} surface={surfaced(app)} />}
        </Show>
      }>
      <Fault message={views.error.message} />
    </Show>
  );
};

export const cellPicks = (buffer, views) =>
  views.map((view) => ({
    label: view.slug,
    current: view === cell(buffer, views),
    signal: `/cell/set ${view.slug} ${named(buffer)}`,
    title: `${view.slug} · cell · ${short(view.mime)}`,
  }));

export const Cell = (props) => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const framed = from(terminal.$buffer);
  const [views] = createResource(
    () => props.buffer,
    (buffer) => cells(buffer, app.client.runtime.attach),
  );
  return (
    <parts.Artcard
      mode={reference(props.buffer.mode)}
      label={named(props.buffer)}
      inframe={framed() === props.buffer}
      picks={views.state === "ready" ? cellPicks(props.buffer, views()) : []}
      onPick={props.onLine}
      onFull={() => props.onLine(`/buffer/full ${named(props.buffer)}`)}>
      <View buffer={props.buffer} listed={cells} picked={cell} />
    </parts.Artcard>
  );
};
