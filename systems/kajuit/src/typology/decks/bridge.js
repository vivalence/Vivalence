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

export function readSafeArea() {
  if (typeof document === "undefined") return 0;
  const style = getComputedStyle(document.documentElement);
  return parseFloat(style.getPropertyValue("--safe-area-top")) || 0;
}

export function viewportDimensions(safeAreaTop) {
  if (typeof window === "undefined") return { width: 0, height: 0, offsetTop: 0 };
  if (window.visualViewport) return {
    width: window.visualViewport.width,
    height: window.visualViewport.height - safeAreaTop,
    offsetTop: window.visualViewport.offsetTop + safeAreaTop,
  };
  return {
    width: window.innerWidth,
    height: window.innerHeight - safeAreaTop,
    offsetTop: safeAreaTop,
  };
}

export function applyViewportOffset(rectMap, offsetTop) {
  const result = {};
  for (const [key, rect] of Object.entries(rectMap)) {
    result[key] = { ...rect, top: rect.top + offsetTop };
  }
  return result;
}

export function isDeviceRotation(bridge) {
  if (typeof window === "undefined") return false;
  const current = bridge.layout.$viewport.get();
  return window.innerWidth !== current.width || window.innerHeight !== current.height;
}

export function resize(bridge) {
  const { layout } = bridge;
  const oldViewport = layout.$viewport.get();
  const orientation = layout.$orientation.get();
  const rotation = isDeviceRotation(bridge);
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

const TAP_MAX_MS = 250;
const TAP_MAX_MOVE = 8;
const MULTI_TAP_WINDOW = 280;
const LONG_PRESS_MS = 420;
const RELEASE_COMMIT_DIST = 32;

export const RADIAL_RADIUS = 108;
export const FLASH_DURATION_MS = 240;

export class Gesture {
  constructor(bridge) {
    this.bridge = bridge;
    this.layout = bridge.layout;
    this.view = bridge.view;
    this.state = {
      pointerId: null,
      downAt: 0,
      downX: 0,
      downY: 0,
      startPincerX: 0,
      startPincerY: 0,
      tapCount: 0,
      tapTimer: null,
      longPressTimer: null,
    };
    this.$dragging = atom(false);
    this.$longPress = atom(false);
    this.$fromSticky = atom(false);
    this.$radial = atom({ show: false, sticky: false, snap: 90 });
    this.$flash = atom(null);
  }

  get dragging() { return this.$dragging.get(); }
  get longPress() { return this.$longPress.get(); }
  get radial() { return this.$radial.get(); }
  get flash() { return this.$flash.get(); }

  reset() {
    clearTimeout(this.state.longPressTimer);
    clearTimeout(this.state.tapTimer);
    this.state.pointerId = null;
    this.state.tapCount = 0;
    this.$dragging.set(false);
    this.$longPress.set(false);
    this.$fromSticky.set(false);
    this.$radial.set({ show: false, sticky: false, snap: 90 });
  }

  down = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const pincer = this.layout.$pincer.get();
    this.state.pointerId = event.pointerId;
    this.state.downAt = Date.now();
    this.state.downX = event.clientX;
    this.state.downY = event.clientY;
    this.state.startPincerX = pincer.x;
    this.state.startPincerY = pincer.y;
    this.$dragging.set(false);
    this.$longPress.set(false);
    this.$fromSticky.set(this.$radial.get().sticky);

    clearTimeout(this.state.longPressTimer);
    this.state.longPressTimer = setTimeout(() => {
      if (this.$dragging.get()) return;
      this.$longPress.set(true);
      const orientation = this.layout.$orientation.get();
      this.$radial.set({ show: true, sticky: false, snap: orientationToSnap(orientation) });
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8);
    }, LONG_PRESS_MS);
  };

  move = (event) => {
    if (this.state.pointerId !== event.pointerId) return;
    const pincer = this.layout.$pincer.get();
    const viewport = this.layout.$viewport.get();
    const deltaX = event.clientX - this.state.downX;
    const deltaY = event.clientY - this.state.downY;
    const distance = Math.hypot(deltaX, deltaY);

    if (this.$longPress.get()) {
      const angle =
        ((Math.atan2(event.clientY - pincer.y, event.clientX - pincer.x) * 180) / Math.PI + 360) %
        360;
      const snap = (Math.round(angle / 90) * 90) % 360;
      this.$radial.set({ ...this.$radial.get(), snap });
      return;
    }

    if (!this.$dragging.get() && distance > TAP_MAX_MOVE) {
      clearTimeout(this.state.longPressTimer);
      this.$dragging.set(true);
      if (this.$fromSticky.get()) {
        this.$radial.set({ ...this.$radial.get(), show: false, sticky: false });
        this.$fromSticky.set(false);
      }
    }

    if (this.$dragging.get()) {
      const rawX = this.state.startPincerX + deltaX;
      const rawY = this.state.startPincerY + deltaY;
      const finalX = this.view.$snap.get() ? snapToGrid(rawX, viewport.width) : rawX;
      const finalY = this.view.$snap.get() ? snapToGrid(rawY, viewport.height) : rawY;
      this.layout.pincer = {
        x: clamp(finalX, EDGE_PADDING, viewport.width - EDGE_PADDING),
        y: clamp(finalY, EDGE_PADDING, viewport.height - EDGE_PADDING),
      };
    }
  };

  up = (event) => {
    if (this.state.pointerId !== event.pointerId) return;
    clearTimeout(this.state.longPressTimer);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (_) {}
    this.state.pointerId = null;

    if (this.$longPress.get()) {
      const pincer = this.layout.$pincer.get();
      const finalDistance = Math.hypot(event.clientX - pincer.x, event.clientY - pincer.y);
      const snap = this.$radial.get().snap;
      if (finalDistance > RELEASE_COMMIT_DIST) {
        this.layout.orientation = snapToOrientation(snap);
        this.$radial.set({ show: false, sticky: false, snap });
        this.bridge.save();
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
      } else {
        this.$radial.set({ ...this.$radial.get(), sticky: true });
      }
      this.$longPress.set(false);
      return;
    }

    if (this.$dragging.get()) {
      this.layout.previous = { x: this.state.startPincerX, y: this.state.startPincerY };
      this.$dragging.set(false);
      this.bridge.save();
      return;
    }

    const elapsed = Date.now() - this.state.downAt;
    if (elapsed < TAP_MAX_MS) {
      if (this.$fromSticky.get()) {
        this.$fromSticky.set(false);
        return;
      }
      this.state.tapCount++;
      clearTimeout(this.state.tapTimer);
      this.state.tapTimer = setTimeout(() => {
        this.handleTaps(this.state.tapCount);
        this.state.tapCount = 0;
      }, MULTI_TAP_WINDOW);
    }
  };

  handleTaps(count) {
    const pincer = this.layout.$pincer.get();
    if (count === 1) {
      this.layout.previous = { ...pincer };
      this.layout.pincer = { ...this.layout.$standard.get() };
      this.pulse("tap1");
    } else if (count === 2) {
      const swap = { ...this.layout.$previous.get() };
      this.layout.previous = { ...pincer };
      this.layout.pincer = swap;
      this.pulse("tap2");
    } else if (count >= 3) {
      this.layout.standard = { ...pincer };
      this.pulse("tap3");
    }
    this.bridge.save();
  }

  pulse(kind) {
    this.$flash.set(kind);
    setTimeout(() => this.$flash.set(null), FLASH_DURATION_MS);
  }

  spoke = (event, angle) => {
    event.stopPropagation();
    if (!this.$radial.get().sticky) return;
    this.layout.orientation = snapToOrientation(angle);
    this.$radial.set({ ...this.$radial.get(), show: false, sticky: false });
    this.bridge.save();
  };

  backdrop = () => {
    this.$radial.set({ ...this.$radial.get(), show: false, sticky: false });
  };
}
