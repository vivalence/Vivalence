  import mount from "./desk.mjs";

  const atom = (value) => {
    const listeners = new Set();
    return {
      get: () => value,
      set: (next) => { value = next; for (const listener of listeners) listener(value); },
      subscribe: (listener) => { listener(value); listeners.add(listener); return () => listeners.delete(listener); },
    };
  };

  const HOUR = 3600000;
  const now = Date.now();
  const mode = {
    name: "Personal", type: "bot", slug: "personal",
    call: { settings: async () => ({ user: "localhost", idle: 21600, platforms: ["whatsapp"] }) },
    entities: {
      thread: { find: async () => [] },
      turn: { find: async () => [], subscribe: () => () => {} },
    },
  };
  const thread = (id, hours) => ({ id, mode, word: "personal", createdAt: new Date(now - hours * HOUR) });
  const threadA = thread("01a2178a-e4fe-774b-be32-79f4332a11c0", 30);
  const threadB = thread("01a2178a-e4fe-774b-be32-79f4332b22d1", 80);
  const threadC = thread("01a2178a-e4fe-774b-be32-79f4332c33e2", 200);
  let count = 0;
  const heard = (held, hours, text, extra = []) => ({
    id: `turn-${count++}`, role: "user", thread: held, mode, createdAt: new Date(now - hours * HOUR),
    parts: [{ type: "text", text }, ...extra],
    meta: { provider: { platform: "whatsapp", id: `wamid.HBgM${count}`, from: "4915100000000", name: "Finn", at: Math.round((now - hours * HOUR) / 1000) } },
  });
  const reply = (held, hours, text) => ({
    id: `turn-${count++}`, role: "assistant", thread: held, mode, createdAt: new Date(now - hours * HOUR), parts: [{ type: "text", text }], meta: null,
  });
  const turns = [
    heard(threadC, 200, "what was the name of that ramen place in Kreuzberg?"),
    reply(threadC, 199.99, "Cocolo, on Paul-Lincke-Ufer. It opens at noon."),
    heard(threadB, 80, "remind me what the runtime port is"),
    reply(threadB, 79.99, "The runtime listens on :2501, anima on :1794."),
    heard(threadB, 79, "and summarise this", [{ type: "document", mime: "application/pdf", data: "" }]),
    reply(threadB, 78.99, "It is a two-page lease addendum: the rent rises 3 % from January, and the notice period stays at three months."),
    heard(threadA, 30, "oi"),
    reply(threadA, 29.99, "Oi! Como posso te ajudar?"),
    heard(threadA, 2, "list the modes that are running right now and tell me which one has the most threads"),
    reply(threadA, 1.99, "Five modes are up: runtime, reader, blog, dojo and personal. *dojo* holds the most threads, 23."),
    heard(threadA, 0.1, "thanks"),
  ];
  const terminal = {
    $thread: atom(threadA),
    setThread: async (held) => terminal.$thread.set(held),
    client: { runtime: { entities: { thread: { $entities: atom([threadA, threadB, threadC]) }, turn: { $entities: atom(turns) } } } },
  };
  mount(document.getElementById("mount"), { terminal, buffer: { mode } });
