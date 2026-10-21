const bar = (parts, world) =>
  parts.Bar({ entity: world.entity, activity: world.activity, harness: world.harness, display: world.display, box: world.box, system: world.system, fault: world.fault, open: null });

const segment = (parts, world) =>
  parts.Segment({
    subject: "activity",
    chord: "a",
    cls: `proc ${parts.ACTIVITY[world.activity.tone].cls}`,
    get children() {
      return [parts.Dot({ tone: parts.ACTIVITY[world.activity.tone].dot, dim: parts.ACTIVITY[world.activity.tone].dot === "" }), world.activity.text === "" ? "idle" : world.activity.text];
    },
  });

const dots = (parts) =>
  [
    ["pos", "healthy", {}],
    ["pri", "running", { live: true }],
    ["cau", "needs you", { breathe: true }],
    ["neg", "fault", {}],
    ["mut", "off", {}],
  ].map(([tone, label, extra]) => {
    const row = document.createElement("span");
    row.className = "specimen-pair";
    row.append(parts.Dot({ tone, ...extra }), ` ${label}`);
    return row;
  });

const meters = (parts) =>
  [12, 34, 71, 92].map((pct) => {
    const row = document.createElement("span");
    row.className = "specimen-pair";
    row.append(parts.Meter({ pct }), ` ${pct} %`);
    return row;
  });

const tabs = (parts, world) => {
  const strip = document.createElement("div");
  strip.className = "specimen-tabs";
  strip.setAttribute("role", "tablist");
  strip.append(...world.terminals.map((terminal) => parts.Tab(terminal)));
  return strip;
};

const mark = (parts, world) => [parts.Mark({ size: 40, live: world.activity.tone === "primary" }), parts.Mark({ size: 20, fault: world.fault })];

const rows = (parts, world) =>
  world.panel.rows.map((row) =>
    parts.Row({
      key: row.key,
      name: row.name,
      value: row.value,
      selected: row.selected,
      off: row.off,
      get children() {
        return row.choices && parts.Choice({ options: row.choices.options, value: row.choices.value, label: row.name });
      },
    }),
  );

const panel = (parts, world) =>
  parts.Panel({
    tag: world.panel.tag,
    crumb: world.panel.crumbs,
    hint: world.panel.hint,
    get children() {
      return rows(parts, world);
    },
  });

const choice = (parts, world) => world.panel.rows.filter((row) => row.choices).map((row) => parts.Choice({ options: row.choices.options, value: row.choices.value, label: row.name }));

const field = (parts, world) => parts.Field({ kind: world.field.kind, value: world.field.value, placeholder: world.field.placeholder, dictating: world.field.dictating });

const turns = (parts, world) => world.journal.map((entry) => parts.Turn(entry));

const consent = (parts, world) => parts.Consent({ call: world.consent });

const pane = (text) => {
  const element = document.createElement("div");
  element.className = "specimen-pane";
  element.textContent = text;
  return element;
};
const split = (parts, world) =>
  parts.Split({
    direction: world.split.direction,
    children: [pane("frame"), parts.Seam({ align: "right", onDrag: () => {}, onShare: () => {}, onReset: () => {} }), pane(`dock · ${Math.round(world.split.share * 100)} %`)],
  });

const markdown = (parts, world) => parts.Markdown({ text: world.markdown });
const json = (parts, world) => parts.JsonTree({ value: world.json });
const image = (parts) => parts.Image({ src: parts.VIKET, alt: "the viket", fit: "contain" });
const html = (parts, world) => parts.Html({ html: world.html });

export const SPECIMENS = [
  ["Bar", bar],
  ["Segment", segment],
  ["Dot", dots],
  ["Meter", meters],
  ["Tab", tabs],
  ["Mark", mark],
  ["Panel", panel],
  ["Row", rows],
  ["Choice", choice],
  ["Field", field],
  ["Turn", turns],
  ["Consent", consent],
  ["Split", split],
  ["Markdown", markdown],
  ["JsonTree", json],
  ["Image", image],
  ["Html", html],
];
