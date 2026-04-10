import { getContext, setContext } from "svelte";
import { atom } from "nanostores";

const DECORUM = Symbol("decorum");
const ZONE = Symbol("decorum-zone");

export class Decorum {
  $theme = atom("dark");

  use(config = {}) {
    const level = config.skeleton ?? 1;
    const prefix = `--colors-skeleton-${level}`;
    return {
      level,
      config,
      surface:   `var(${prefix}-surface)`,
      contrast:  `var(${prefix}-contrast)`,
      boundary:  `var(${prefix}-boundary)`,
      primary:   role(prefix, "primary"),
      secondary: role(prefix, "secondary"),
      accent:    role(prefix, "accent"),
      info:      role(prefix, "info"),
      success:   role(prefix, "success"),
      warning:   role(prefix, "warning"),
      danger:    role(prefix, "danger"),
    };
  }
}

function role(prefix, name) {
  return {
    base:   `var(${prefix}-${name}-base)`,
    hover:  `var(${prefix}-${name}-hover)`,
    active: `var(${prefix}-${name}-active)`,
  };
}

export function setDecorum(decorum) {
  setContext(DECORUM, decorum);
}

export function useDecorum() {
  return getContext(DECORUM);
}

export function setZone(zone) {
  setContext(ZONE, zone);
}

export function useZone() {
  return getContext(ZONE);
}

export { DECORUM, ZONE };
