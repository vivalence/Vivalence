export { JsonTree } from "../JsonTree.jsx";

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
