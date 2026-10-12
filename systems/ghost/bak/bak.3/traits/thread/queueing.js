export const depth = (thread) => thread.trait.QUEUEING?.depth ?? 1;

export const valid = (thread) => (depth(thread) >= 1 ? null : "QUEUEING depth < 1");
