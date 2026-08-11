export const LIGHTHOUSE = Symbol("lighthouse"); // dataspaces & daemons
export const BRIDGE = Symbol("bridge"); // layout & controls
export const TERMINALS = Symbol("terminals"); // terminals collection + active terminal/thread/daemon/mode
// export const BOX = Symbol("box"); // device drivers — mic, speaker, etc.

const UNKNOWN = { change: "unknown", commit: "unknown", authored: null, built: null };

const stamped = typeof __VIVA_BUILD__ === "undefined" ? UNKNOWN : __VIVA_BUILD__;

const text = (value, fallback) => (typeof value === "string" && value ? value : fallback);

export const build = {
  change: text(stamped?.change, UNKNOWN.change),
  commit: text(stamped?.commit, UNKNOWN.commit),
  authored: stamped?.authored ?? null,
  built: stamped?.built ?? null,
  known: text(stamped?.change, UNKNOWN.change) !== UNKNOWN.change,
};
