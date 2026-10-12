const PANES = ["signin", "crown", "dock", "frame", "navigation"];

export const memory = () => {
  const held = new Map();
  return {
    read: (origin) => (held.has(origin) ? held.get(origin) : null),
    write: (origin, record) => held.set(origin, record),
    clear: (origin) => held.delete(origin),
  };
};

export const headless = ({ credentials = memory(), accept = ["application/json"] } = {}) => {
  const placed = [];
  const emitted = [];
  return {
    name: "headless",
    viewport: () => ({ width: 120, height: 40 }),
    credentials,
    accept,
    keys: (async function* () {})(),
    interactive: false,
    emit: (kind, props) => emitted.push({ [kind]: props }),
    hold: (kind) => Promise.reject(new Error(`${kind}: headless holds nothing`)),
    placed,
    emitted,
    mount: Object.fromEntries(PANES.map((pane) => [pane, () => ({ place: (layout) => placed.push({ pane, panes: layout.panes }), destroy: () => placed.push({ pane, panes: null }) })])),
  };
};
