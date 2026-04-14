import { atom } from "nanostores";

export const BONE_THICKNESS = 45;
export const PINCER_SIZE = BONE_THICKNESS;
export const HALF = BONE_THICKNESS / 2;
export const EDGE_PADDING = HALF;

const SNAP_DOMINANT = [0, 50, 100];
const SNAP_SECONDARY = [13, 21, 34, 66, 79, 87];
export const SNAP_PERCENTS = [...SNAP_DOMINANT, ...SNAP_SECONDARY].sort((a, b) => a - b);
export const SNAP_DISTANCE = 28;

export function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function snapToGrid(value, axisLength) {
  let nearest = value;
  let nearestDist = SNAP_DISTANCE;
  for (const percent of SNAP_PERCENTS) {
    const target = (percent / 100) * axisLength;
    const distance = Math.abs(value - target);
    if (distance < nearestDist) {
      nearest = target;
      nearestDist = distance;
    }
  }
  return nearest;
}

export function rectsForOrientation(orientation, pincer, viewportWidth, viewportHeight) {
  if (orientation === 0) {
    return {
      a: { left: 0, top: 0, width: viewportWidth, height: Math.max(0, pincer.y - HALF) },
      b: {
        left: 0,
        top: pincer.y + HALF,
        width: Math.max(0, pincer.x - HALF),
        height: Math.max(0, viewportHeight - pincer.y - HALF),
      },
      c: {
        left: pincer.x + HALF,
        top: pincer.y + HALF,
        width: Math.max(0, viewportWidth - pincer.x - HALF),
        height: Math.max(0, viewportHeight - pincer.y - HALF),
      },
    };
  }
  if (orientation === 90) {
    return {
      a: { left: 0, top: 0, width: Math.max(0, pincer.x - HALF), height: viewportHeight },
      b: {
        left: pincer.x + HALF,
        top: 0,
        width: Math.max(0, viewportWidth - pincer.x - HALF),
        height: Math.max(0, pincer.y - HALF),
      },
      c: {
        left: pincer.x + HALF,
        top: pincer.y + HALF,
        width: Math.max(0, viewportWidth - pincer.x - HALF),
        height: Math.max(0, viewportHeight - pincer.y - HALF),
      },
    };
  }
  if (orientation === 180) {
    return {
      a: {
        left: 0,
        top: pincer.y + HALF,
        width: viewportWidth,
        height: Math.max(0, viewportHeight - pincer.y - HALF),
      },
      b: {
        left: pincer.x + HALF,
        top: 0,
        width: Math.max(0, viewportWidth - pincer.x - HALF),
        height: Math.max(0, pincer.y - HALF),
      },
      c: {
        left: 0,
        top: 0,
        width: Math.max(0, pincer.x - HALF),
        height: Math.max(0, pincer.y - HALF),
      },
    };
  }
  if (orientation === 270) {
    return {
      a: {
        left: pincer.x + HALF,
        top: 0,
        width: Math.max(0, viewportWidth - pincer.x - HALF),
        height: viewportHeight,
      },
      b: {
        left: 0,
        top: 0,
        width: Math.max(0, pincer.x - HALF),
        height: Math.max(0, pincer.y - HALF),
      },
      c: {
        left: 0,
        top: pincer.y + HALF,
        width: Math.max(0, pincer.x - HALF),
        height: Math.max(0, viewportHeight - pincer.y - HALF),
      },
    };
  }
}

export function bonesForOrientation(orientation, pincer, viewportWidth, viewportHeight) {
  if (orientation === 0) {
    return {
      shoulder: {
        left: 0,
        top: pincer.y - HALF,
        width: Math.max(0, pincer.x - HALF),
        height: BONE_THICKNESS,
      },
      crown: {
        left: pincer.x + HALF,
        top: pincer.y - HALF,
        width: Math.max(0, viewportWidth - pincer.x - HALF),
        height: BONE_THICKNESS,
      },
      pincer: {
        left: pincer.x - HALF,
        top: pincer.y - HALF,
        width: BONE_THICKNESS,
        height: BONE_THICKNESS,
      },
      spine: {
        left: pincer.x - HALF,
        top: pincer.y + HALF,
        width: BONE_THICKNESS,
        height: Math.max(0, viewportHeight - pincer.y - HALF),
      },
    };
  }
  if (orientation === 90) {
    return {
      shoulder: {
        left: pincer.x - HALF,
        top: 0,
        width: BONE_THICKNESS,
        height: Math.max(0, pincer.y - HALF),
      },
      crown: {
        left: pincer.x - HALF,
        top: pincer.y + HALF,
        width: BONE_THICKNESS,
        height: Math.max(0, viewportHeight - pincer.y - HALF),
      },
      pincer: {
        left: pincer.x - HALF,
        top: pincer.y - HALF,
        width: BONE_THICKNESS,
        height: BONE_THICKNESS,
      },
      spine: {
        left: pincer.x + HALF,
        top: pincer.y - HALF,
        width: Math.max(0, viewportWidth - pincer.x - HALF),
        height: BONE_THICKNESS,
      },
    };
  }
  if (orientation === 180) {
    return {
      shoulder: {
        left: pincer.x + HALF,
        top: pincer.y - HALF,
        width: Math.max(0, viewportWidth - pincer.x - HALF),
        height: BONE_THICKNESS,
      },
      crown: {
        left: 0,
        top: pincer.y - HALF,
        width: Math.max(0, pincer.x - HALF),
        height: BONE_THICKNESS,
      },
      pincer: {
        left: pincer.x - HALF,
        top: pincer.y - HALF,
        width: BONE_THICKNESS,
        height: BONE_THICKNESS,
      },
      spine: {
        left: pincer.x - HALF,
        top: 0,
        width: BONE_THICKNESS,
        height: Math.max(0, pincer.y - HALF),
      },
    };
  }
  if (orientation === 270) {
    return {
      shoulder: {
        left: pincer.x - HALF,
        top: pincer.y + HALF,
        width: BONE_THICKNESS,
        height: Math.max(0, viewportHeight - pincer.y - HALF),
      },
      crown: {
        left: pincer.x - HALF,
        top: 0,
        width: BONE_THICKNESS,
        height: Math.max(0, pincer.y - HALF),
      },
      pincer: {
        left: pincer.x - HALF,
        top: pincer.y - HALF,
        width: BONE_THICKNESS,
        height: BONE_THICKNESS,
      },
      spine: {
        left: 0,
        top: pincer.y - HALF,
        width: Math.max(0, pincer.x - HALF),
        height: BONE_THICKNESS,
      },
    };
  }
}

export function snapToOrientation(snapAngle) {
  return { 0: 90, 90: 0, 180: 270, 270: 180 }[snapAngle] ?? 0;
}

export function orientationToSnap(currentOrientation) {
  return { 0: 90, 90: 0, 180: 270, 270: 180 }[currentOrientation] ?? 90;
}

export function snapLabel(angle) {
  return { 0: "→", 90: "↓", 180: "���", 270: "↑" }[angle] ?? "";
}

const STORAGE_KEY = "vivalence:bridge";

export class Bridge {
  constructor() {
    const saved = loadFromStorage();

    this.layout = store(
      {
        pincer: saved?.pincer ?? { x: 0, y: 0 },
        previous: saved?.previous ?? { x: 0, y: 0 },
        standard: saved?.standard ?? { x: 0, y: 0 },
        orientation: saved?.orientation ?? 0,
        inspectorHeight: saved?.inspectorHeight ?? 0,
        viewport: { width: 0, height: 0 },
        home: { x: 0, y: 1 },
        start: { x: 0.33, y: 0.4 },
      },
      ["pincer", "previous", "standard", "orientation", "inspectorHeight"],
    );

    this.view = store(
      {
        d: saved?.view?.d ?? "outside",
        g: false,
        h: false,
        snap: true,
      },
      ["d"],
    );

    this.paneSize = store(
      {
        d: saved?.paneSize?.d ?? null,
        e: saved?.paneSize?.e ?? null,
        f: saved?.paneSize?.f ?? null,
        panes: saved?.paneSize?.panes ?? { d: true, f: true },
      },
      ["d", "e", "f", "panes"],
    );
  }

  toggle = (key) => {
    this.view["$" + key].set(!this.view["$" + key].get());
  };

  save = () => {
    try {
      const data = { ...this.layout.toJSON(), view: this.view.toJSON(), paneSize: this.paneSize.toJSON() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  };
}

function loadFromStorage() {
  try {
    const raw = typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function store(defaults, serialize) {
  const instance = {};
  const atoms = {};
  for (const [key, initial] of Object.entries(defaults)) {
    const a = atom(initial);
    atoms[key] = a;
    instance["$" + key] = a;
    Object.defineProperty(instance, key, {
      get() {
        return a.get();
      },
      set(v) {
        a.set(v);
      },
    });
  }
  const keys = serialize || Object.keys(defaults);
  instance.toJSON = () => Object.fromEntries(keys.map((k) => [k, atoms[k].get()]));
  return instance;
}
