import { atom } from "nanostores";
import {
  EDGE_PADDING,
  clamp,
  isDeviceRotation,
  readSafeArea,
  viewportDimensions,
} from "./geometry.js";

const STORAGE_KEY = "vivalence:bridge";

export const DEFAULT_DOCK = {
  side: "right",
  share: 0.32,
};

export const DEFAULT_COMPOSER = {
  enterSends: true,
  density: "comfortable",
};

function store(defaults, serialize) {
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

function loadFromStorage() {
  try {
    const raw = typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

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
        "d.threads": saved?.view?.["d.threads"] ?? true,
        "d.intents": saved?.view?.["d.intents"] ?? true,
        "d.modes": saved?.view?.["d.modes"] ?? true,
        f: saved?.view?.f ?? "buffers",
        g: false,
        h: false,
        snap: true,
      },
      ["d", "d.threads", "d.intents", "d.modes", "f"],
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

    this.$safeAreaTop = atom(0);
    this.$viewportOffsetTop = atom(0);
  }

  get safeAreaTop() { return this.$safeAreaTop.get(); }
  get viewportOffsetTop() { return this.$viewportOffsetTop.get(); }

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

export function bootLayout(bridge) {
  const { layout } = bridge;
  bridge.$safeAreaTop.set(readSafeArea());
  const next = viewportDimensions(bridge.$safeAreaTop.get());
  layout.viewport = { width: next.width, height: next.height };
  bridge.$viewportOffsetTop.set(next.offsetTop);

  const saved = layout.$pincer.get();
  const hasSaved = saved.x !== 0 || saved.y !== 0;

  if (hasSaved) {
    layout.pincer = {
      x: clamp(saved.x, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(saved.y, EDGE_PADDING, next.height - EDGE_PADDING),
    };
    const prev = layout.$previous.get();
    layout.previous = {
      x: clamp(prev.x, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(prev.y, EDGE_PADDING, next.height - EDGE_PADDING),
    };
    const std = layout.$standard.get();
    layout.standard = {
      x: clamp(std.x, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(std.y, EDGE_PADDING, next.height - EDGE_PADDING),
    };
  } else {
    const start = layout.$start.get();
    const home = layout.$home.get();
    layout.pincer = {
      x: clamp(start.x * next.width, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(start.y * next.height, EDGE_PADDING, next.height - EDGE_PADDING),
    };
    layout.previous = { ...layout.pincer };
    layout.standard = {
      x: clamp(home.x * next.width, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(home.y * next.height, EDGE_PADDING, next.height - EDGE_PADDING),
    };
  }
}

export function resize(bridge) {
  const { layout } = bridge;
  const oldViewport = layout.$viewport.get();
  const orientation = layout.$orientation.get();
  const rotation = isDeviceRotation(layout);
  const next = viewportDimensions(bridge.$safeAreaTop.get());
  layout.viewport = { width: next.width, height: next.height };
  bridge.$viewportOffsetTop.set(next.offsetTop);

  if (rotation && oldViewport.width > 0 && oldViewport.height > 0) {
    const deltaWidth = next.width - oldViewport.width;
    const deltaHeight = next.height - oldViewport.height;

    let shiftX = 0;
    let shiftY = 0;
    if (orientation === 0) shiftY = deltaHeight;
    else if (orientation === 90) shiftX = deltaWidth;
    else if (orientation === 180) shiftX = deltaWidth;

    const reanchor = (position) => ({
      x: clamp(position.x + shiftX, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(position.y + shiftY, EDGE_PADDING, next.height - EDGE_PADDING),
    });

    layout.pincer = reanchor(layout.$pincer.get());
    layout.previous = reanchor(layout.$previous.get());
    layout.standard = reanchor(layout.$standard.get());
  } else {
    const current = layout.$pincer.get();
    layout.pincer = {
      x: clamp(current.x, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(current.y, EDGE_PADDING, next.height - EDGE_PADDING),
    };
  }
}

export function attachViewport(bridge) {
  if (typeof window === "undefined") return () => {};
  const onResize = () => resize(bridge);
  window.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("scroll", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("scroll", onResize);
  };
}
