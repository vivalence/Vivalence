export const daemons = (runtime) => [runtime.daemon, ...runtime.daemons];

export const owner = (runtime, mode) => {
  const found = daemons(runtime).find((daemon) => daemon.modes.includes(mode));
  if (found === undefined) throw new Error(`[reading] no daemon of ${runtime.reference.absolute} holds mode ${mode.slug}`);
  return found;
};

export const DONE = { mark: "●", tone: "success" };
export const PENDING = { mark: "◐", tone: "warning" };
export const IDLE = { mark: "○", tone: "muted" };
export const FAILED = { mark: "✕", tone: "danger" };

const STATUS = [
  [(code) => code === "HEALTHY" || code === "RUNNING", DONE],
  [(code) => code === "MOUNTING", PENDING],
  [(code) => code === "UNAVAILABLE" || code === "ERROR", FAILED],
  [(code) => code === null || code === undefined, IDLE],
  [() => true, { mark: "?", tone: "muted" }],
];

export const status = (held) => STATUS.find(([test]) => test(held.code))[1];

const STANDING = [
  [["VERIFIED", "AUTHENTICATED", "REFRESHED", "POPULATING"], DONE],
  [["AUTHENTICATING", "VERIFYING", "REFRESHING"], PENDING],
  [["IDLE", "LOGGED_OUT"], IDLE],
  [["OFFLINE", "ERROR", "SESSION_EXPIRED"], FAILED],
];

export const standing = (code) => {
  const found = STANDING.find(([codes]) => codes.includes(code));
  if (found === undefined) throw new Error(`[reading] not a lighthouse standing: ${JSON.stringify(code)}`);
  return found[1];
};

export const signature = (mode) => (mode.manifest.traits.length === 0 ? "—" : mode.manifest.traits.join(" · "));

export const groups = (modes) => {
  const sorted = [...modes].sort((first, second) => first.manifest.slug.localeCompare(second.manifest.slug));
  const keyed = Map.groupBy(sorted, signature);
  return [...keyed.entries()].sort(([first], [second]) => first.localeCompare(second));
};

export const who = (user) => {
  if (user === null) return null;
  if (typeof user.slug === "string") return user.slug;
  if (typeof user.id === "string") return user.id;
  return null;
};
