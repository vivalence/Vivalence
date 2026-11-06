import { from } from "solid-js";
import { Dynamic } from "solid-js/web";
import * as parts from "@vivalence/drapes/parts";
import * as ambient from "../../ambient/index.js";
import { candidates, cell, cells, renderer, surfaced } from "../../widgets/buffer/index.js";
import { named, reference, short } from "../sidebar/sections.js";

export const View = (props) => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const pool = from(candidates(props.buffer, app.client.runtime.entities.file.$entities));
  const views = () => props.listed(pool());
  return (
    <Dynamic
      component={renderer(props.buffer, views())}
      terminal={terminal}
      buffer={props.buffer}
      views={views()}
      picked={props.picked}
      surface={surfaced(app)}
    />
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
  const pool = from(candidates(props.buffer, app.client.runtime.entities.file.$entities));
  return (
    <parts.Artcard
      mode={reference(props.buffer.mode)}
      label={named(props.buffer)}
      inframe={framed() === props.buffer}
      picks={cellPicks(props.buffer, cells(pool()))}
      onPick={props.onLine}
      onFull={() => props.onLine(`/buffer/full ${named(props.buffer)}`)}>
      <View buffer={props.buffer} listed={cells} picked={cell} />
    </parts.Artcard>
  );
};
