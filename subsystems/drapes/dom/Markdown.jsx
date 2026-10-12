import { For } from "solid-js";
import { parseBlocks } from "../display/markdown.js";

const INLINE = {
  text: (segment) => segment.text,
  bold: (segment) => <strong class="kit-markdown-strong">{segment.text}</strong>,
  italic: (segment) => <em class="kit-markdown-em">{segment.text}</em>,
  code: (segment) => <code class="kit-markdown-inline-code">{segment.text}</code>,
  link: (segment) => (
    <a class="kit-markdown-link" href={segment.href} target="_blank" rel="noreferrer noopener">
      {segment.text}
    </a>
  ),
};

const Inline = (props) => <For each={props.segments}>{(segment) => INLINE[segment.kind](segment)}</For>;

const copy = (text) => {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(text).catch(() => {});
};

const wraps = (lang) => lang === "" || lang === "txt" || lang === "text";

const BLOCKS = {
  paragraph: (block) => (
    <p class="kit-markdown-p">
      <Inline segments={block.inline} />
    </p>
  ),
  heading: (block) => (
    <div class={`kit-markdown-h kit-markdown-h${block.level}`}>
      <Inline segments={block.inline} />
    </div>
  ),
  "code-block": (block) => (
    <div class="kit-markdown-code">
      <header class="kit-markdown-code-head">
        <span class="kit-markdown-lang">{block.lang === "" ? "txt" : block.lang}</span>
        <button class="kit-markdown-copy" type="button" title="copy" onClick={() => copy(block.text)}>
          copy
        </button>
      </header>
      <pre class="kit-markdown-pre" classList={{ "kit-markdown-wrap": wraps(block.lang) }}>
        {block.text}
      </pre>
    </div>
  ),
  list: (block) => {
    const items = <For each={block.items}>{(item) => <li><Inline segments={item.inline} /></li>}</For>;
    return block.ordered ? <ol class="kit-markdown-list">{items}</ol> : <ul class="kit-markdown-list">{items}</ul>;
  },
  blockquote: (block) => (
    <div class="kit-markdown-quote">
      <Inline segments={block.inline} />
    </div>
  ),
  table: (block) => (
    <div class="kit-markdown-table-wrap">
      <table class="kit-markdown-table">
        <thead>
          <tr>
            <For each={block.header}>{(cell) => <th><Inline segments={cell} /></th>}</For>
          </tr>
        </thead>
        <tbody>
          <For each={block.rows}>
            {(row) => (
              <tr>
                <For each={row}>{(cell) => <td><Inline segments={cell} /></td>}</For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  ),
  hr: () => <hr class="kit-markdown-hr" />,
};

export const Markdown = (props) => (
  <div class="kit-markdown">
    <For each={parseBlocks(props.text)}>{(block) => BLOCKS[block.kind](block)}</For>
  </div>
);

export const style = `
.kit-markdown {
  min-width: 0;
}
.kit-markdown-p {
  margin: 0;
  padding: 0;
  word-break: break-word;
  white-space: pre-wrap;
}
.kit-markdown-p + .kit-markdown-p {
  margin-top: 6px;
}
.kit-markdown-h {
  font-weight: 700;
  margin: 4px 0 2px;
  line-height: 1.2;
  color: var(--text-header);
}
.kit-markdown-h1 { font-size: 1.3em; }
.kit-markdown-h2 { font-size: 1.18em; }
.kit-markdown-h3 { font-size: 1.08em; }
.kit-markdown-h4 { font-size: 1em; }
.kit-markdown-h5, .kit-markdown-h6 { font-size: 0.95em; }
.kit-markdown-list {
  margin: 4px 0;
  padding-left: 18px;
}
.kit-markdown-list li {
  margin: 1px 0;
  line-height: 1.4;
}
.kit-markdown-quote {
  border-left: 2px solid var(--signal-primary-tint);
  padding: 2px 0 2px 8px;
  color: var(--text-light);
  margin: 4px 0;
}
.kit-markdown-hr {
  border: none;
  border-top: 1px solid var(--divider);
  margin: 6px 0;
}
.kit-markdown-code {
  margin: 6px 0;
  border: 1px solid var(--boundary-soft);
  border-radius: var(--shape-radius-xs);
  background: var(--surface-sunk);
  overflow: hidden;
}
.kit-markdown-code-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px 3px 8px;
  border-bottom: 1px solid var(--boundary-soft);
  font-size: var(--font-size-2xs);
  letter-spacing: 0.08em;
  text-transform: lowercase;
}
.kit-markdown-lang {
  flex: 1;
  color: var(--text-muted);
}
.kit-markdown-copy {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font: inherit;
  cursor: pointer;
  padding: 0;
}
.kit-markdown-copy:hover {
  color: var(--signal-primary-ink);
}
.kit-markdown-pre {
  margin: 0;
  padding: 6px 8px;
  font-family: var(--font-family-code);
  font-size: var(--font-size-xs);
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
  color: var(--text-strong);
}
.kit-markdown-pre.kit-markdown-wrap {
  white-space: pre-wrap;
  overflow-wrap: break-word;
  overflow-x: visible;
}
.kit-markdown-table-wrap {
  margin: 6px 0;
  overflow-x: auto;
  border: 1px solid var(--boundary-soft);
  border-radius: var(--shape-radius-xs);
}
.kit-markdown-table {
  border-collapse: collapse;
  width: 100%;
}
.kit-markdown-table th,
.kit-markdown-table td {
  padding: 4px 8px;
  text-align: left;
  border-bottom: 1px solid var(--divider);
  white-space: nowrap;
}
.kit-markdown-table th {
  color: var(--signal-primary-ink);
  text-transform: lowercase;
  letter-spacing: 0.08em;
  font-weight: 400;
  font-size: var(--font-size-2xs);
  background: var(--surface-sunk);
}
.kit-markdown-table tbody tr:last-child td {
  border-bottom: none;
}
.kit-markdown-inline-code {
  font-family: var(--font-family-code);
  font-size: 0.92em;
  padding: 1px 4px;
  border-radius: var(--shape-radius-2xs);
  background: var(--surface-sunk);
  color: var(--text-code);
}
.kit-markdown-strong {
  font-weight: 700;
  color: var(--text-strong);
}
.kit-markdown-em {
  font-style: italic;
}
.kit-markdown-link {
  color: var(--text-link);
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 2px;
}
.kit-markdown-link:hover {
  text-decoration-style: solid;
}
`;
