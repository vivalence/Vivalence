import { atom } from "nanostores";
import {
  EDGE_PADDING,
  clamp,
  isDeviceRotation,
  readSafeArea,
  viewportDimensions,
} from "./geometry.js";
import { restore } from "./panes.js";
const STORAGE_KEY = "vivalence:bridge";

export const DEFAULT_COMPOSER = {
  enterSends: true,
  density: "comfortable",
};

export const FONT_SIZES = {
  "2xs": "11px",
  xs: "12.5px",
  sm: "14px",
  base: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "22.5px",
};

export const THEMES = ["northsea", "parchment", "porcelain", "datasette"];

export const knownTheme = (name) => (THEMES.includes(name) ? name : THEMES[0]);

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
    const turn = saved?.orientation ?? 0;

    this.layout = store(
      {
        pincer: saved?.pincer ?? { x: 0, y: 0 },
        previous: { orientation: turn, ...(saved?.previous ?? { x: 0, y: 0 }) },
        standard: { orientation: turn, ...(saved?.standard ?? { x: 0, y: 0 }) },
        orientation: turn,
        inspectorHeight: saved?.inspectorHeight ?? 0,
        locked: saved?.locked === true,
        viewport: { width: 0, height: 0 },
        home: { x: 0, y: 1 },
        start: { x: 0.33, y: 0.4 },
      },
      ["pincer", "previous", "standard", "orientation", "inspectorHeight", "locked"],
    );

    this.view = store(
      {
        fold: saved?.view?.fold === "stack" ? "stack" : "page",
        strip: saved?.view?.strip === "top" ? "top" : "bottom",
        g: false,
        h: false,
        snap: true,
        hair: saved?.view?.hair === true,
        full: false,
        theme: knownTheme(saved?.view?.theme),
        fontSize: saved?.view?.fontSize ?? "base",
      },
      ["fold", "strip", "hair", "theme", "fontSize"],
    );

    this.panes = store(restore(saved?.panes), ["tree", "fold", "expanded", "heights"]);

    this.$safeAreaTop = atom(0);
    this.$viewportOffsetTop = atom(0);

    this.$composer = atom(
      saved?.composer ? { ...DEFAULT_COMPOSER, ...saved.composer } : { ...DEFAULT_COMPOSER },
    );
  }

  get safeAreaTop() { return this.$safeAreaTop.get(); }
  get viewportOffsetTop() { return this.$viewportOffsetTop.get(); }

  get composer() { return this.$composer.get(); }
  set composer(value) {
    this.$composer.set({ ...DEFAULT_COMPOSER, ...(value ?? {}) });
    this.save();
  }

  toggle = (key) => {
    this.view["$" + key].set(!this.view["$" + key].get());
  };

  setTheme = (name) => {
    this.view.$theme.set(knownTheme(name));
    this.save();
  };

  setFontSize = (name) => {
    this.view.$fontSize.set(name);
    this.save();
  };

  setFold = (name) => {
    this.view.$fold.set(name === "stack" ? "stack" : "page");
    this.save();
  };

  setStrip = (place) => {
    this.view.$strip.set(place === "top" ? "top" : "bottom");
    this.save();
  };

  save = () => {
    try {
      const data = { ...this.layout.toJSON(), view: this.view.toJSON(), panes: this.panes.toJSON(), composer: this.composer };
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
      ...prev,
      x: clamp(prev.x, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(prev.y, EDGE_PADDING, next.height - EDGE_PADDING),
    };
    const std = layout.$standard.get();
    layout.standard = {
      ...std,
      x: clamp(std.x, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(std.y, EDGE_PADDING, next.height - EDGE_PADDING),
    };
  } else {
    const start = layout.$start.get();
    const home = layout.$home.get();
    const orientation = layout.$orientation.get();
    layout.pincer = {
      x: clamp(start.x * next.width, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(start.y * next.height, EDGE_PADDING, next.height - EDGE_PADDING),
    };
    layout.previous = { ...layout.pincer, orientation };
    layout.standard = {
      x: clamp(home.x * next.width, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(home.y * next.height, EDGE_PADDING, next.height - EDGE_PADDING),
      orientation,
    };
  }
}

export function resize(bridge) {
  const { layout } = bridge;
  const oldViewport = layout.$viewport.get();
  const orientation = layout.$orientation.get();
  const rotation = isDeviceRotation(layout);
  const next = viewportDimensions(bridge.$safeAreaTop.get());
  if (next.offsetTop !== bridge.$viewportOffsetTop.get()) bridge.$viewportOffsetTop.set(next.offsetTop);
  if (next.width === oldViewport.width && next.height === oldViewport.height) return false;
  layout.viewport = { width: next.width, height: next.height };

  if (rotation && oldViewport.width > 0 && oldViewport.height > 0) {
    const deltaWidth = next.width - oldViewport.width;
    const deltaHeight = next.height - oldViewport.height;

    let shiftX = 0;
    let shiftY = 0;
    if (orientation === 0) shiftY = deltaHeight;
    else if (orientation === 90) shiftX = deltaWidth;
    else if (orientation === 180) shiftX = deltaWidth;

    const reanchor = (position) => ({
      ...position,
      x: clamp(position.x + shiftX, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(position.y + shiftY, EDGE_PADDING, next.height - EDGE_PADDING),
    });

    layout.pincer = reanchor(layout.$pincer.get());
    layout.previous = reanchor(layout.$previous.get());
    layout.standard = reanchor(layout.$standard.get());
  } else {
    const current = layout.$pincer.get();
    const clamped = {
      x: clamp(current.x, EDGE_PADDING, next.width - EDGE_PADDING),
      y: clamp(current.y, EDGE_PADDING, next.height - EDGE_PADDING),
    };
    if (clamped.x !== current.x || clamped.y !== current.y) layout.pincer = clamped;
  }
  return true;
}

export function attachViewport(bridge) {
  if (typeof window === "undefined") return () => {};
  let frame = 0;
  const anchor = () => {
    if (window.scrollY || window.scrollX) window.scrollTo(0, 0);
  };
  const sync = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      anchor();
      resize(bridge);
    });
  };
  window.addEventListener("resize", sync);
  window.addEventListener("scroll", anchor, { passive: true });
  window.addEventListener("focusout", sync);
  window.visualViewport?.addEventListener("resize", sync);
  window.visualViewport?.addEventListener("scroll", sync);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", sync);
    window.removeEventListener("scroll", anchor);
    window.removeEventListener("focusout", sync);
    window.visualViewport?.removeEventListener("resize", sync);
    window.visualViewport?.removeEventListener("scroll", sync);
  };
}
