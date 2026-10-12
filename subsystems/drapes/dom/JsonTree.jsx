import { createSignal, For, mergeProps, Show } from "solid-js";

const KINDS = [
  [(value) => value === null, "null"],
  [(value) => value === undefined, "undefined"],
  [(value) => Array.isArray(value), "array"],
  [(value) => value instanceof Date, "date"],
  [(value) => typeof value === "object", "object"],
  [(value) => typeof value === "function", "function"],
  [(value) => typeof value === "string", "string"],
  [(value) => typeof value === "number" || typeof value === "bigint", "number"],
  [(value) => typeof value === "boolean", "boolean"],
  [() => true, "other"],
];

export const kind = (value) => KINDS.find(([test]) => test(value))[1];

const containers = new Set(["array", "object"]);

const entries = (value) => (Array.isArray(value) ? value.map((item, index) => [index, item]) : Object.entries(value));

const preview = (value) => (Array.isArray(value) ? `[ ${value.length} ]` : `{ ${Object.keys(value).length} }`);

const LEAVES = {
  null: () => <span class="kit-json-value kit-json-null">null</span>,
  undefined: () => <span class="kit-json-value kit-json-muted">—</span>,
  string: (value) => <span class="kit-json-value kit-json-string">{JSON.stringify(value)}</span>,
  number: (value) => <span class="kit-json-value kit-json-number">{String(value)}</span>,
  boolean: (value) => <span class="kit-json-value kit-json-boolean">{String(value)}</span>,
  date: (value) => <span class="kit-json-value kit-json-null">{value.toISOString()}</span>,
  function: (value) => <span class="kit-json-value kit-json-muted">[fn {value.name === "" ? "anonymous" : value.name}]</span>,
  other: (value) => <span class="kit-json-value">{String(value)}</span>,
};

const copy = (value) => (event) => {
  event.stopPropagation();
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(JSON.stringify(value, null, 2)).catch(() => {});
};

const Name = (props) => (
  <Show when={props.name !== null}>
    <span class="kit-json-key">{props.name}</span>
    <span class="kit-json-colon">:</span>
  </Show>
);

export const JsonTree = (props) => {
  const held = mergeProps({ name: null, depth: 0, openDepth: 2, maxDepth: 12, breadth: 100 }, props);
  const [expanded, setExpanded] = createSignal(held.depth < held.openDepth);
  const [all, setAll] = createSignal(false);
  const shown = () => (all() ? entries(held.value) : entries(held.value).slice(0, held.breadth));
  const overflow = () => entries(held.value).length - shown().length;
  return (
    <Show
      when={containers.has(kind(held.value))}
      fallback={
        <div class="kit-json-line kit-json-leaf">
          <Name name={held.name} />
          {LEAVES[kind(held.value)](held.value)}
          <button class="kit-json-copy" type="button" title="copy" onClick={copy(held.value)}>⧉</button>
        </div>
      }>
      <div class="kit-json-node" data-depth={held.depth}>
        <div class="kit-json-line kit-json-head" onClick={() => setExpanded(!expanded())}>
          <span class="kit-json-arrow" classList={{ "kit-json-open": expanded() }}>▸</span>
          <Name name={held.name} />
          <span class="kit-json-preview">{preview(held.value)}</span>
          <button class="kit-json-copy" type="button" title="copy" onClick={copy(held.value)}>⧉</button>
        </div>
        <Show when={expanded()}>
          <div class="kit-json-children">
            <Show when={held.depth < held.maxDepth} fallback={<span class="kit-json-muted">…</span>}>
              <For each={shown()}>
                {([name, child]) => (
                  <JsonTree
                    name={name}
                    value={child}
                    depth={held.depth + 1}
                    openDepth={held.openDepth}
                    maxDepth={held.maxDepth}
                    breadth={held.breadth}
                  />
                )}
              </For>
              <Show when={overflow() > 0}>
                <button class="kit-json-more" type="button" onClick={() => setAll(true)}>
                  {overflow()} more…
                </button>
              </Show>
            </Show>
          </div>
        </Show>
      </div>
    </Show>
  );
};

export const style = `
.kit-json-node {
  min-width: 0;
}
.kit-json-line {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1px 4px 1px 0;
  font-family: var(--font-family-code);
  font-size: var(--font-size-2xs);
  line-height: 1.7;
  white-space: nowrap;
  color: var(--text-ink);
}
.kit-json-head {
  cursor: pointer;
}
.kit-json-head:hover,
.kit-json-leaf:hover {
  background: var(--control-selected);
  border-radius: var(--shape-radius-2xs);
}
.kit-json-arrow {
  display: inline-block;
  width: 9px;
  flex-shrink: 0;
  color: var(--text-muted);
  transition: transform 0.1s;
}
.kit-json-arrow.kit-json-open {
  transform: rotate(90deg);
}
.kit-json-key {
  color: var(--text-strong);
}
.kit-json-colon {
  color: var(--text-muted);
  margin-left: -2px;
}
.kit-json-preview {
  color: var(--text-muted);
}
.kit-json-children {
  padding-left: 11px;
  margin-left: 4px;
  border-left: 1px solid var(--divider);
}
.kit-json-string {
  color: var(--signal-positive-ink);
}
.kit-json-number {
  color: var(--signal-primary-ink);
}
.kit-json-boolean {
  color: var(--signal-caution-ink);
}
.kit-json-null,
.kit-json-muted {
  color: var(--text-muted);
}
.kit-json-copy {
  opacity: 0;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: var(--font-size-2xs);
  padding: 0 2px;
  line-height: 1;
}
.kit-json-line:hover .kit-json-copy {
  opacity: 0.6;
}
.kit-json-copy:hover {
  opacity: 1;
  color: var(--signal-primary-ink);
}
.kit-json-more {
  border: none;
  background: transparent;
  color: var(--signal-primary-ink);
  cursor: pointer;
  font-family: var(--font-family-code);
  font-size: var(--font-size-2xs);
  padding: 1px 0 1px 11px;
}
`;
