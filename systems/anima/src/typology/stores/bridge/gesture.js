import { atom } from "nanostores";
import {
  EDGE_PADDING,
  clamp,
  orientationToSnap,
  snapToGrid,
  snapToOrientation,
} from "./geometry.js";

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
