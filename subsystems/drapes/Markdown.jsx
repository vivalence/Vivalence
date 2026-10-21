import { For, mergeProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { parseBlocks } from "./display/markdown.js";

const INLINE = {
  text: (segment) => segment.text,
  bold: (segment) => <strong>{segment.text}</strong>,
  italic: (segment) => <em>{segment.text}</em>,
  code: (segment) => <code>{segment.text}</code>,
  link: (segment) => (
    <a href={segment.href} target="_blank" rel="noreferrer noopener">
      {segment.text}
    </a>
  ),
};

const Inline = (props) => <For each={props.segments}>{(segment) => INLINE[segment.kind](segment)}</For>;

const BLOCKS = {
  paragraph: (block) => (
    <p>
      <Inline segments={block.inline} />
    </p>
  ),
  heading: (block) => (
    <Dynamic component={`h${Math.min(block.level, 3)}`}>
      <Inline segments={block.inline} />
    </Dynamic>
  ),
  "code-block": (block) => (
    <pre>
      <code>{block.text}</code>
    </pre>
  ),
  list: (block) => (
    <Dynamic component={block.ordered ? "ol" : "ul"}>
      <For each={block.items}>
        {(item) => (
          <li>
            <Inline segments={item.inline} />
          </li>
        )}
      </For>
    </Dynamic>
  ),
  blockquote: (block) => (
    <blockquote>
      <Inline segments={block.inline} />
    </blockquote>
  ),
  table: (block) => (
    <table>
      <thead>
        <tr>
          <For each={block.header}>
            {(cell) => (
              <th>
                <Inline segments={cell} />
              </th>
            )}
          </For>
        </tr>
      </thead>
      <tbody>
        <For each={block.rows}>
          {(row) => (
            <tr>
              <For each={row}>
                {(cell) => (
                  <td>
                    <Inline segments={cell} />
                  </td>
                )}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  ),
  hr: () => <hr />,
};

export const Markdown = (props) => {
  const held = mergeProps({ class: "md" }, props);
  return (
    <div class={held.class}>
      <For each={parseBlocks(held.text)}>{(block) => BLOCKS[block.kind](block)}</For>
    </div>
  );
};
