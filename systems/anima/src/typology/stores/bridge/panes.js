export const PANE_BAR = 44;
export const PANE_HEAD = 32;
export const PANE_MIN = 60;
export const PANE_NAMES = ["terminal", "navigation", "thread", "mode", "buffer", "harness"];
export const FOLDS = ["page", "stack", "accordion", "free"];
export const RATIO_MIN = 0.15;
export const RATIO_MAX = 0.85;

const WHOLE = { x: 0, y: 0, w: 100, h: 100 };
const CORE = [0.3, 0.7];
const PAGED = ["page", "accordion"];

const leaf = (pane) => ({ type: "leaf", pane });
const split = (dir, ratio, a, b) => ({ type: "split", dir, ratio, a, b });
const within = (value) => value > CORE[0] && value < CORE[1];

const BESIDE = {
  left: (held, fresh) => split("h", 0.5, fresh, held),
  right: (held, fresh) => split("h", 0.5, held, fresh),
  top: (held, fresh) => split("v", 0.5, fresh, held),
  bottom: (held, fresh) => split("v", 0.5, held, fresh),
};

export const leaves = (tree) => (!tree ? [] : tree.type === "leaf" ? [tree.pane] : [...leaves(tree.a), ...leaves(tree.b)]);

export const remove = (tree, pane) => {
  if (!tree) return null;
  if (tree.type === "leaf") return tree.pane === pane ? null : tree;
  const a = remove(tree.a, pane);
  const b = remove(tree.b, pane);
  return !a ? b : !b ? a : { ...tree, a, b };
};

export const open = (tree, pane) => {
  if (!tree) return leaf(pane);
  if (leaves(tree).includes(pane)) return tree;
  if (pane === "terminal") return split("v", 0.3, leaf(pane), tree);
  return split(tree.type === "split" && tree.dir === "v" ? "h" : "v", 0.5, tree, leaf(pane));
};

export const swap = (tree, first, second) => {
  if (!tree) return tree;
  if (tree.type === "leaf") return tree.pane === first ? leaf(second) : tree.pane === second ? leaf(first) : tree;
  return { ...tree, a: swap(tree.a, first, second), b: swap(tree.b, first, second) };
};

export const insert = (tree, target, pane, edge) => {
  if (!tree) return leaf(pane);
  if (tree.type === "leaf") return tree.pane === target ? BESIDE[edge](tree, leaf(pane)) : tree;
  return { ...tree, a: insert(tree.a, target, pane, edge), b: insert(tree.b, target, pane, edge) };
};

export const move = (tree, pane, target, zone) => (zone === "center" ? swap(tree, pane, target) : insert(remove(tree, pane), target, pane, zone));

export const setRatio = (tree, path, ratio) =>
  path.length === 0
    ? { ...tree, ratio: Math.min(RATIO_MAX, Math.max(RATIO_MIN, ratio)) }
    : { ...tree, [path[0]]: setRatio(tree[path[0]], path.slice(1), ratio) };

export const solo = (tree, pane, previous) => (tree?.type === "leaf" && previous ? { tree: previous, previous: null } : { tree: leaf(pane), previous: tree });

export const zone = (rect, x, y) => {
  const across = (x - rect.x) / rect.w;
  const down = (y - rect.y) / rect.h;
  if (within(across) && within(down)) return "center";
  const edges = { left: across, right: 1 - across, top: down, bottom: 1 - down };
  return Object.keys(edges).sort((first, second) => edges[first] - edges[second])[0];
};

export const under = (held, x, y) => held.find((leaf) => x >= leaf.x && x <= leaf.x + leaf.w && y >= leaf.y && y <= leaf.y + leaf.h) ?? null;

const LANDING = {
  center: ({ x, y, w, h }) => ({ x: x + w * 0.2, y: y + h * 0.2, w: w * 0.6, h: h * 0.6 }),
  left: ({ x, y, w, h }) => ({ x, y, w: w / 2, h }),
  right: ({ x, y, w, h }) => ({ x: x + w / 2, y, w: w / 2, h }),
  top: ({ x, y, w, h }) => ({ x, y, w, h: h / 2 }),
  bottom: ({ x, y, w, h }) => ({ x, y: y + h / 2, w, h: h / 2 }),
};

export const landing = (rect, edge) => LANDING[edge](rect);

export const layout = (tree, rect = WHOLE, path = "") => {
  if (!tree) return { leaves: [], splits: [] };
  if (tree.type === "leaf") return { leaves: [{ pane: tree.pane, ...rect, path }], splits: [] };
  const { x, y, w, h } = rect;
  const first = tree.dir === "h" ? { x, y, w: w * tree.ratio, h } : { x, y, w, h: h * tree.ratio };
  const second = tree.dir === "h" ? { x: x + first.w, y, w: w - first.w, h } : { x, y: y + first.h, w, h: h - first.h };
  const seam = tree.dir === "h" ? { path, dir: "h", x: second.x, y, h, parent: rect } : { path, dir: "v", x, y: second.y, w, parent: rect };
  const a = layout(tree.a, first, `${path}a`);
  const b = layout(tree.b, second, `${path}b`);
  return { leaves: [...a.leaves, ...b.leaves], splits: [...a.splits, seam, ...b.splits] };
};

export const arrange = (tree, fold, expanded, heights = {}) => {
  if (fold === "free") return layout(tree);
  const order = leaves(tree);
  const shown = order.includes(expanded) ? expanded : order[0];
  if (fold === "page") return { leaves: shown ? [{ pane: shown, ...WHOLE }] : [], splits: [] };
  if (fold === "stack") return { leaves: order.map((pane) => ({ pane, flow: true, height: heights[pane] ?? null })), splits: [] };
  const at = order.indexOf(shown);
  return {
    leaves: order.map((pane, index) => ({ pane, folded: index !== at, heads: order.length - 1, above: index <= at ? index : null, below: index > at ? order.length - index : null })),
    splits: [],
  };
};

export const shown = (tree, expanded) => (leaves(tree).includes(expanded) ? expanded : (leaves(tree)[0] ?? null));

export const latched = ({ tree, fold, expanded }, pane) => (PAGED.includes(fold) ? shown(tree, expanded) === pane : leaves(tree).includes(pane));

export const tap = ({ tree, fold }, pane) => {
  if (!leaves(tree).includes(pane)) return { tree: open(tree, pane), expanded: pane };
  return PAGED.includes(fold) ? { expanded: pane } : { tree: remove(tree, pane) };
};

export const available = ({ terminals = 0, thread = false, buffers = 0, application = false, harnessed = false }) => ({
  terminal: true,
  navigation: terminals > 0,
  thread,
  mode: thread,
  buffer: thread && (buffers > 0 || application),
  harness: thread && harnessed,
});

export const prune = (tree, allowed) => leaves(tree).filter((pane) => !allowed[pane]).reduce(remove, tree);

export const DEFAULT = { tree: open(leaf("navigation"), "terminal"), fold: "page", expanded: "terminal", heights: {}, previous: null };

export const restore = (saved) =>
  saved?.tree && FOLDS.includes(saved.fold) && leaves(saved.tree).every((pane) => PANE_NAMES.includes(pane))
    ? { tree: saved.tree, fold: saved.fold, expanded: saved.expanded ?? leaves(saved.tree)[0], heights: saved.heights ?? {}, previous: null }
    : structuredClone(DEFAULT);
