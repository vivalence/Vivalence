export const HOST = {
  HEALTHY: "on",
  RUNNING: "on",
  MOUNTING: "pending",
  IDLE: "off",
  RELEASED: "off",
  UNAVAILABLE: "fault",
  ERROR: "fault",
};

export const STANDING = {
  IDLE: "off",
  AUTHENTICATING: "pending",
  AUTHENTICATED: "on",
  VERIFYING: "pending",
  REFRESHING: "pending",
  REFRESHED: "on",
  POPULATING: "pending",
  VERIFIED: "on",
  OFFLINE: "fault",
  ERROR: "fault",
  SESSION_EXPIRED: "fault",
  LOGGED_OUT: "off",
};

export const pip = (table, code) => (Object.hasOwn(table, code) ? table[code] : "unknown");
