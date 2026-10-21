import { createSignal, For } from "solid-js";
import { Field } from "./Field.jsx";
import { Row } from "./Row.jsx";

export const narrow = (catalog, typed) => catalog.filter((command) => command.nature.includes(typed));

export const Catalog = (props) => {
  const [typed, setTyped] = createSignal("");
  return (
    <box style={{ flexDirection: "column" }}>
      <Field palette={props.palette} prompt="line" value={typed()} onInput={setTyped} />
      <For each={narrow(props.catalog, typed())}>
        {(command) => <Row palette={props.palette} key="" label={command.nature} value={command.chord} onPick={() => props.onPick(command.nature)} />}
      </For>
    </box>
  );
};
