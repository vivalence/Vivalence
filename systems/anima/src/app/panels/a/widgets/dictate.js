export function spliceAt(draft, anchor, text) {
  if (!text) return { draft, caret: anchor };
  const at = Math.max(0, Math.min(anchor, draft.length));
  const head = draft.slice(0, at);
  const rest = draft.slice(at);
  const lead = head && !/\s$/.test(head) ? " " : "";
  const trail = rest && !/^\s/.test(rest) ? " " : "";
  return { draft: head + lead + text + trail + rest, caret: at + lead.length + text.length };
}
