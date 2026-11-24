const head = (thread) => thread.trait.ARMED.loaded.slice(0, thread.trait.ARMED.sealed);
const load = (thread, path) => ({
  ...thread,
  trait: { ARMED: { ...thread.trait.ARMED, loaded: [...thread.trait.ARMED.loaded, path] } },
});
const seal = (thread) => ({
  ...thread,
  trait: { ARMED: { ...thread.trait.ARMED, sealed: thread.trait.ARMED.loaded.length } },
});

const opened = { trait: { ARMED: { loaded: [], sealed: 0 } } };
const twice = load(load(opened, "/harvest"), "/research");
const compacted = seal(twice);
const later = load(compacted, "/shell");

for (const thread of [opened, twice, compacted, later])
  console.log(JSON.stringify({ ARMED: thread.trait.ARMED, head: head(thread) }));
