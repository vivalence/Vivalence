import { from, Show } from "solid-js";
import * as ambient from "../../ambient/index.js";
import { Journal } from "./journal.jsx";
import { Composer } from "./composer.jsx";

export function Dock(props) {
  const terminal = ambient.terminal.consume();
  const thread = from(terminal.$thread);
  const terminals = from(terminal.client.runtime.entities.terminal.$entities);
  const dock = () => {
    terminals();
    return terminal.dock;
  };
  return (
    <box style={{ flexDirection: "column", flexGrow: 1, backgroundColor: props.palette.surface }}>
      <Show when={thread()} keyed fallback={<box style={{ flexGrow: 1 }} />}>
        {(seated) => (
          <>
            <Journal palette={props.palette} thread={seated} lens={dock().lens} markdown={dock().markdown} />
            <Composer palette={props.palette} thread={seated} />
          </>
        )}
      </Show>
    </box>
  );
}
