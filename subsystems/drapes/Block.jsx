import { For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Bench } from "./Bench.jsx";
import { Markdown } from "./Markdown.jsx";
import { Prog } from "./Prog.jsx";
import { INSET, Yield } from "./Yield.jsx";

const Table = (props) => (
  <div class="block">
    <table>
      <Show when={props.block.head !== undefined && props.block.head.some(Boolean)}>
        <thead>
          <tr>
            <For each={props.block.head}>{(cell) => <th>{cell}</th>}</For>
          </tr>
        </thead>
      </Show>
      <tbody>
        <For each={props.block.rows}>
          {(row) => (
            <tr>
              <For each={row}>{(cell) => <td>{cell}</td>}</For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  </div>
);

const Select = (props) => (
  <div class="block">
    <div class="opts">
      <For each={props.block.options}>{(option) => <button onClick={() => props.onLine(option.signal)}>{option.label}</button>}</For>
    </div>
  </div>
);

export const BLOCKS = {
  table: Table,
  select: Select,
  progress: (props) => <Prog label={props.block.label} pct={props.block.pct} done={props.block.done} />,
  bench: (props) => <Bench head={props.block.head} meta={props.block.meta} items={props.block.items} foot={props.block.foot} onLine={props.onLine} />,
  md: (props) => (
    <div class="block">
      <Markdown text={props.block.source} />
    </div>
  ),
  json: (props) => (
    <div class="block">
      <Yield value={props.block.value} style={INSET} />
    </div>
  ),
};

const shaped = (type) => {
  if (!Object.hasOwn(BLOCKS, type)) throw new Error(`[drapes] not a block: ${JSON.stringify(type)} · ${Object.keys(BLOCKS).join(" · ")}`);
  return BLOCKS[type];
};

export const Block = (props) => <Dynamic component={shaped(props.block.type)} block={props.block} onLine={props.onLine} />;
