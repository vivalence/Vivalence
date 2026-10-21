export const seed = () => ({ nodes: new Map(), roots: [] });

export const chronicle = (records) => records.reduce(step, seed());

export const key = (path) => JSON.stringify(path);

export const pathname = (path) =>
  path
    .flatMap((nature) => nature.split("/"))
    .filter((segment) => segment !== "")
    .join("/");

const sprout = (story, record) => {
  const node = { path: record.path, nature: record.path.at(-1), timing: null, fault: null, entries: [], children: [] };
  story.nodes.set(key(record.path), node);
  (story.nodes.get(key(record.path.slice(0, -1)))?.children ?? story.roots).push(node);
  return node;
};

const MARKS = [
  [(record) => record.track === "start", (node, record) => (node.timing = { ...node.timing, begun: record.at })],
  [(record) => record.track === "stop", (node, record) => (node.timing = { ...node.timing, sealed: record.at })],
  [(record) => record.track === "fault", (node, record) => (node.fault = { at: record.at, ...record.data })],
  [() => true, (node, record) => node.entries.push({ track: record.track, at: record.at, data: record.data })],
];

export const step = (story, record) => {
  const node = story.nodes.get(key(record.path)) ?? sprout(story, record);
  MARKS.find(([test]) => test(record))[1](node, record);
  return { ...story };
};

export const dictate = (story) => {
  const records = [];
  const walk = (node) => {
    if (node.timing?.begun != null) records.push({ at: node.timing.begun, path: node.path, track: "start" });
    for (const entry of node.entries) records.push({ at: entry.at, path: node.path, track: entry.track, data: entry.data });
    if (node.fault) {
      const { at, ...data } = node.fault;
      records.push({ at, path: node.path, track: "fault", data });
    }
    node.children.forEach(walk);
    if (node.timing?.sealed != null) records.push({ at: node.timing.sealed, path: node.path, track: "stop" });
  };
  story.roots.forEach(walk);
  return records;
};

export const live = (span) => span.pipe.fold(chronicle(span.history), step);

export const duration = (node) =>
  node.timing?.begun != null && node.timing?.sealed != null ? node.timing.sealed - node.timing.begun : null;

export const timing = (story) => {
  const entries = [];
  const walk = (node) => {
    const elapsed = duration(node);
    if (elapsed != null) entries.push(`${node.nature};dur=${elapsed.toFixed(1)}`);
    node.children.forEach(walk);
  };
  story.roots.forEach(walk);
  return entries.join(", ");
};
