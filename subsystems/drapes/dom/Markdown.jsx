export { Markdown } from "../Markdown.jsx";

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
