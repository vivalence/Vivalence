export const PANE_BAR = 44;
export const PANE_FOLD_ZONE = 84;
export const PANE_DOCK_PULL = 34;
export const PANE_MIN = 180;

export const PANE_NAMES = ["instance", "terminal", "buffer"];

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const sum = (indices, sizes) => indices.reduce((total, i) => total + sizes[i], 0);

export function openPanes(open) {
  const indices = [];
  for (let i = 0; i < open.length; i++) if (open[i]) indices.push(i);
  return indices;
}

export function dockedPanes(open) {
  const indices = [];
  for (let i = 0; i < open.length; i++) if (!open[i]) indices.push(i);
  return indices;
}

export function isPaneFolded(size) {
  return size <= PANE_BAR + 0.5;
}

export function paneBoundary(oi, index) {
  const k = oi.indexOf(index);
  return k === 0 ? 1 : k;
}

function heaviest(indices, weight) {
  return indices.reduce((best, i) => ((weight[i] ?? 0) > (weight[best] ?? 0) ? i : best), indices[0]);
}

export function normalisePanes(open, fold, weight, area) {
  const sizes = open.map(() => 0);
  const oi = openPanes(open);
  if (!oi.length) return sizes;

  const unfolded = oi.filter((i) => !fold[i]);
  const run = unfolded.length ? unfolded : [heaviest(oi, weight)];
  for (const i of oi) if (!run.includes(i)) sizes[i] = PANE_BAR;

  const available = Math.max(run.length * PANE_BAR, area - (oi.length - run.length) * PANE_BAR);
  const floor = Math.min(PANE_MIN, available / run.length);
  const share = {};
  for (const i of run) share[i] = Math.max(1, weight[i] || 1);

  let active = run.slice();
  for (;;) {
    const budget = available - (run.length - active.length) * floor;
    const total = active.reduce((carry, i) => carry + share[i], 0) || 1;
    const under = active.filter((i) => (budget * share[i]) / total < floor - 0.01);
    if (!under.length || active.length === 1) {
      for (const i of active) sizes[i] = Math.max(floor, (budget * share[i]) / total);
      for (const i of run) if (!active.includes(i)) sizes[i] = floor;
      break;
    }
    active = active.filter((i) => !under.includes(i));
  }
  return sizes;
}

export function fitPaneRun(order, start, total) {
  const sizes = {};
  if (!order.length) return sizes;
  for (const i of order) sizes[i] = start[i];
  let delta = total - sum(order, start);
  if (delta >= 0) {
    sizes[order[0]] += delta;
    return sizes;
  }
  for (const i of order) {
    const take = Math.min(sizes[i] - PANE_BAR, -delta);
    sizes[i] -= take;
    delta += take;
    if (delta > -0.001) break;
  }
  return sizes;
}

export function pushPanes(sizes, oi, boundary, delta, area) {
  const before = oi.slice(0, boundary);
  const after = oi.slice(boundary);
  const edge = clamp(
    sum(before, sizes) + delta,
    before.length * PANE_BAR,
    area - after.length * PANE_BAR,
  );
  const next = sizes.slice();
  Object.assign(
    next,
    fitPaneRun(before.slice().reverse(), sizes, edge),
    fitPaneRun(after, sizes, area - edge),
  );
  return next;
}

export function settlePanes(sizes, open) {
  const next = sizes.slice();
  const unfolded = openPanes(open).filter((i) => next[i] > PANE_BAR + 0.5);
  const under = unfolded.filter((i) => next[i] < PANE_MIN);
  const donors = unfolded.filter((i) => next[i] > PANE_MIN);
  if (!under.length || !donors.length) return next;

  const deficit = {};
  const surplus = {};
  for (const i of under) deficit[i] = PANE_MIN - next[i];
  for (const i of donors) surplus[i] = next[i] - PANE_MIN;
  const need = under.reduce((carry, i) => carry + deficit[i], 0);
  const spare = donors.reduce((carry, i) => carry + surplus[i], 0);
  const take = Math.min(need, spare);

  for (const i of under) next[i] += (take * deficit[i]) / need;
  for (const i of donors) next[i] -= (take * surplus[i]) / spare;
  return next;
}

export function layoutPanes(rect, { open, fold, weight, sizes = null }) {
  const tall = rect.height >= rect.width;
  const oi = openPanes(open);
  const docked = dockedPanes(open);
  const twig = docked.length ? PANE_BAR : 0;
  const area = Math.max(0, tall ? rect.height - twig : rect.width);
  const size = sizes ?? normalisePanes(open, fold, weight, area);

  const places = open.map(() => null);
  const tabWidth = docked.length ? rect.width / docked.length : 0;
  docked.forEach((i, slot) => {
    places[i] = { left: slot * tabWidth, top: 0, width: tabWidth, height: PANE_BAR };
  });

  let offset = tall ? twig : 0;
  for (const i of oi) {
    places[i] = tall
      ? { left: 0, top: offset, width: rect.width, height: size[i] }
      : { left: offset, top: twig, width: size[i], height: Math.max(0, rect.height - twig) };
    offset += size[i];
  }
  return { tall, oi, docked, twig, area, size, places };
}
