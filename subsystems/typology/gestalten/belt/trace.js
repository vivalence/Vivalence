export const chronicle = (records) => records.reduce(chronicle.step, chronicle.seed());

chronicle.seed = () => ({ nodes: new Map(), roots: [] });

chronicle.step = (story, record) => {
  const node = story.nodes.get(record.span) ?? sprout(story, record);
  switch (record.verb) {
    case "open":
      node.timing = { ...node.timing, begun: record.at };
      break;
    case "close":
      node.timing = { ...node.timing, sealed: record.at };
      break;
    case "fault":
      node.fault = { at: record.at, ...record.data };
      break;
    default:
      node.entries.push({ verb: record.verb, at: record.at, data: record.data });
  }
  return { ...story };
};

const sprout = (story, record) => {
  const node = {
    id: record.span,
    nature: record.path.split("/").filter(Boolean).at(-1) ?? null,
    path: record.path,
    timing: null,
    fault: null,
    entries: [],
    children: [],
  };
  story.nodes.set(record.span, node);
  const parent = story.nodes.get(record.trace);
  (parent?.children ?? story.roots).push(node);
  return node;
};

export const dictate = (story) => {
  const records = [];
  const walk = (node, parent) => {
    const base = { span: node.id, trace: parent?.id ?? null, path: node.path };
    if (node.timing?.begun != null) records.push({ ...base, verb: "open", at: node.timing.begun });
    for (const entry of node.entries) records.push({ ...base, verb: entry.verb, at: entry.at, data: entry.data });
    if (node.fault) {
      const { at, ...data } = node.fault;
      records.push({ ...base, verb: "fault", at, data });
    }
    for (const child of node.children) walk(child, node);
    if (node.timing?.sealed != null) records.push({ ...base, verb: "close", at: node.timing.sealed });
  };
  for (const root of story.roots) walk(root, null);
  return records;
};

export const live = (span) => span.pipe.reactive(chronicle(span.records), chronicle.step);

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

export const sealed = (record) => !record.trace && record.verb === "close";

export const faulty = (story) => [...story.nodes.values()].some((node) => node.fault);

export const slower = (threshold) => (story) => story.roots.some((root) => duration(root) > threshold);

export const gather = (until, drain) => {
  let records = [];
  const write = (record) => {
    records.push(record);
    if (until(record, records)) write.flush();
  };
  write.flush = () => {
    if (records.length) drain(records);
    records = [];
  };
  return write;
};

export const flow = (sink) => sink;

export const hold = (sink, until = sealed) => gather(until, (records) => records.forEach(sink));

export const decant = (sink, keep, until = sealed) =>
  gather(until, (records) => keep(chronicle(records)) && records.forEach(sink));
