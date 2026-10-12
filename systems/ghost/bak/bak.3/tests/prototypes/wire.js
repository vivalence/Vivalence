export const DATAMAP = {
  daemon: { properties: { modes: { kind: "1:m", target: "mode", mappedBy: "daemon" } }, columns: {} },
  mode: { properties: { daemon: { kind: "m:1", target: "daemon", nullable: true } }, columns: {} },
  terminal: {
    properties: { daemon: { kind: "m:1", target: "daemon", nullable: true }, thread: { kind: "m:1", target: "thread", nullable: true } },
    columns: {},
  },
  intent: { properties: {}, columns: {} },
  thread: {
    properties: {
      mode: { kind: "m:1", target: "mode", nullable: true },
      intent: { kind: "m:1", target: "intent", nullable: true },
      buffers: { kind: "1:m", target: "buffer", mappedBy: "thread" },
      turns: { kind: "1:m", target: "turn", mappedBy: "thread" },
    },
    columns: {},
  },
  buffer: { properties: { thread: { kind: "m:1", target: "thread", nullable: true }, mode: { kind: "m:1", target: "mode", nullable: true } }, columns: {} },
  turn: { properties: { thread: { kind: "m:1", target: "thread" }, mode: { kind: "m:1", target: "mode", nullable: true } }, columns: {} },
  activity: { properties: { thread: { kind: "m:1", target: "thread", nullable: true } }, columns: {} },
};

export const recording = (log, answers = {}, path = "") => ({
  url: { pathname: path, absolute: `stub://${path}` },
  call: async (endpoint, body) => {
    const at = `${path}${endpoint}`;
    log.push({ path: at, body });
    if (Object.hasOwn(answers, at)) return answers[at](body);
    if (endpoint === "/updateOne") return { ...body.where, ...body.data };
    if (endpoint === "/metadata/datamap") return DATAMAP;
    if (endpoint === "/find") return [];
    return null;
  },
  branch: (segment) => recording(log, answers, `${path}${segment}`),
  subscribe: () => () => {},
  aim: (endpoint) => (body = {}) => recording(log, answers, path).call(endpoint, body),
  stream: async function* (endpoint, signal, options) {
    log.push({ path: `${path}${endpoint}`, body: options.body, method: options.method });
    yield { verb: "open" };
  },
});
