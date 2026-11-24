# limit: 5000 chars · a .dc.html comp, rendered live outside claude.ai: its template + DCLogic class under a tiny runtime + its kit css
# usage: python3 .ikiro/methods/dcrender.py <comp.dc.html> <kit.css> <out-dir> → serve <out-dir> on a FREE port, open index.html?theme=porcelain&face=dom&ear=true
# stage a state from the console: __comp.m.<field> = …; __comp.forceUpdate()   (11-17 m123 design pass)
import re, sys, pathlib

RUNTIME = r"""class DCLogic {
  constructor(props) { this.props = props; }
  forceUpdate() { window.__render(); }
}
const evaluate = (expr, scope) => new Function("s", `with (s) { return (${expr}); }`)(scope);
const MUSTACHE = /\{\{\s*([^}]+?)\s*\}\}/g;
const whole = (text) => { const m = text.match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/); return m ? m[1] : null; };
const interpolate = (text, scope) => text.replace(MUSTACHE, (_, expr) => { const v = evaluate(expr, scope); return v === null || v === undefined ? "" : String(v); });
const EVENTS = { onclick: "click", onkeydown: "keydown", onchange: "input" };
function build(node, scope, parent) {
  if (node.nodeType === 3) { parent.appendChild(document.createTextNode(interpolate(node.textContent, scope))); return; }
  if (node.nodeType !== 1) return;
  const tag = node.tagName.toLowerCase();
  if (tag === "helmet") return;
  if (tag === "sc-if") { if (evaluate(whole(node.getAttribute("value")), scope)) for (const child of node.childNodes) build(child, scope, parent); return; }
  if (tag === "sc-for") {
    const list = evaluate(whole(node.getAttribute("list")), scope) || [];
    const as = node.getAttribute("as");
    for (const item of list) for (const child of node.childNodes) build(child, { __proto__: scope, [as]: item }, parent);
    return;
  }
  const el = node.cloneNode(false);
  for (const attr of [...node.attributes]) {
    const name = attr.name.toLowerCase();
    if (name.startsWith("hint-")) { el.removeAttribute(attr.name); continue; }
    if (EVENTS[name]) { el.removeAttribute(attr.name); const fn = evaluate(whole(attr.value), scope); if (fn) el.addEventListener(EVENTS[name], fn); continue; }
    if (name === "ref") { el.removeAttribute(attr.name); const ref = evaluate(whole(attr.value), scope); if (ref) ref.current = el; continue; }
    if (name === "value" && (tag === "textarea" || tag === "input")) { el.removeAttribute(attr.name); el.value = interpolate(attr.value, scope); continue; }
    if (attr.value.includes("{{")) el.setAttribute(attr.name, interpolate(attr.value, scope));
  }
  for (const child of node.childNodes) build(child, scope, el);
  parent.appendChild(el);
}
window.__boot = (Component) => {
  const query = new URLSearchParams(location.search);
  const props = { theme: query.get("theme") || "northsea", face: query.get("face") || "dom", ear: query.get("ear") !== "false" };
  const template = document.getElementById("dc");
  const mount = document.getElementById("mount");
  const component = new Component(props);
  window.__comp = component;
  window.__render = () => {
    const vals = component.renderVals();
    document.documentElement.dataset.theme = vals.theme;
    const fragment = document.createDocumentFragment();
    for (const child of template.content.childNodes) build(child, vals, fragment);
    const active = document.activeElement && document.activeElement.getAttribute("data-role");
    mount.replaceChildren(fragment);
    if (active) { const el = mount.querySelector(`[data-role="${active}"]`); if (el) { el.focus(); if (el.setSelectionRange) el.setSelectionRange(el.value.length, el.value.length); } }
  };
  window.__render();
  component.componentDidMount();
};
"""

comp, css, out = sys.argv[1], sys.argv[2], pathlib.Path(sys.argv[3])
source = pathlib.Path(comp).read_text()
helmet = re.search(r"<helmet>(.*?)</helmet>", source, re.S)
body = re.search(r"(?:</helmet>|<x-dc>)(.*?)</x-dc>", source, re.S).group(1)
script = re.search(r'<script type="text/x-dc"[^>]*>(.*?)</script>', source, re.S).group(1)
out.mkdir(parents=True, exist_ok=True)
(out / "runtime.js").write_text(RUNTIME)
(out / "vivalence.css").write_text(pathlib.Path(css).read_text())
(out / "index.html").write_text(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>comp</title>'
    f'<link rel="stylesheet" href="vivalence.css">{helmet.group(1) if helmet else ""}'
    '<script src="runtime.js"></script></head>'
    f'<body><template id="dc">{body}</template><div id="mount"></div>'
    f"<script>{script}\nwindow.__boot(Component);</script></body></html>"
)
print(out / "index.html")
