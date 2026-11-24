import { from, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import * as parts from "@vivalence/drapes/solid";
import * as ambient from "../../ambient/index.js";
import { candidates, cell, cells, renderer, skinned } from "../../widgets/buffer/index.js";
import { named, reference, short } from "../sidebar/sections.js";

export const Surface = (props) => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const pool = from(candidates(props.buffer, app.client.runtime.entities.file.$entities));
  const surfaces = () => props.listed(pool());
  return (
    <Dynamic
      component={renderer(props.buffer, surfaces())}
      terminal={terminal}
      buffer={props.buffer}
      surfaces={surfaces()}
      picked={props.picked}
      skin={skinned(app)}
    />
  );
};

export const cellPicks = (buffer, surfaces) =>
  surfaces.map((surface) => ({
    label: surface.slug,
    current: surface === cell(buffer, surfaces),
    signal: `/cell/set ${surface.slug} ${named(buffer)}`,
    title: `${surface.slug} · cell · ${short(surface.mime)}`,
  }));

export const Cell = (props) => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const framed = from(terminal.$buffer);
  const pool = from(candidates(props.buffer, app.client.runtime.entities.file.$entities));
  return (
    <Show
      when={cells(pool()).length > 0}
      fallback={
        <parts.Artchip
          mode={reference(props.buffer.mode)}
          label={named(props.buffer)}
          inframe={framed() === props.buffer}
          onOpen={() => props.onLine(`/buffer "${named(props.buffer)}"`)}
          onFull={() => props.onLine(`/buffer/full ${named(props.buffer)}`)}
        />
      }
    >
      <parts.Artcard
        mode={reference(props.buffer.mode)}
        label={named(props.buffer)}
        inframe={framed() === props.buffer}
        picks={cellPicks(props.buffer, cells(pool()))}
        onPick={props.onLine}
        onFull={() => props.onLine(`/buffer/full ${named(props.buffer)}`)}
      >
        <Surface buffer={props.buffer} listed={cells} picked={cell} />
      </parts.Artcard>
    </Show>
  );
};
