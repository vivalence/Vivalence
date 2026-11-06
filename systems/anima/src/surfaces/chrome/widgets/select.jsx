import { For } from "solid-js";
import * as parts from "@vivalence/drapes/parts";
import * as ambient from "../ambient/index.js";

export const Select = (props) => {
  const terminal = ambient.terminal.consume();
  return (
    <label
      class="asel"
      title={props.entries
        .map((entry) => entry.title)
        .join("\n")}>
      <select
        data-linesel="1"
        aria-label={props.label}
        onChange={(event) =>
          terminal.repl
            .dispatch(event.currentTarget.value)
            .catch((error) => terminal.controller.stdout.fault(error))
        }>
        <For each={props.entries}>
          {(entry) => (
            <option value={entry.signal} selected={entry.current}>
              {entry.label}
            </option>
          )}
        </For>
      </select>
      <parts.Icon name="chev" size={12} />
    </label>
  );
};
