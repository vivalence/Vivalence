import { atom } from "nanostores";
import {
  BONE_THICKNESS,
  EDGE_PADDING,
  HALF,
  clamp,
  orientationToSnap,
  snapToGrid,
  snapToOrientation,
  snapToWall,
} from "./geometry.js";

const TAP_MAX_MS = 250;
const TAP_MAX_MOVE = 8;
const MULTI_TAP_WINDOW = 280;
const LONG_PRESS_MS = 420;
const VELOCITY_WINDOW = 80;
const WALL_ONSET = 120;

export const RADIAL_RADIUS = 108;
export const FLASH_DURATION_MS = 240;

const UNIT = RADIAL_RADIUS / 98;
export const DEAD_ZONE = 26 * UNIT;
const RING = 89 * UNIT + 2;
const BAND = { out: 24 * UNIT, in: 12 * UNIT };
const HELD_BAND = { out: 30 * UNIT, in: 18 * UNIT };
const SPAN_OUT = 110 * UNIT;
const SPAN_IN = Math.max(20, RING - BAND.in - DEAD_ZONE);
const TOGGLE_REACH = { from: 40 * UNIT, to: 100 * UNIT };
const TOGGLE_ARC = 20;
export const TOGGLES = { snap: 315, hair: 225, full: 135 };
const NEAR = 172;
const DOZE = { mouse: 600, touch: 2500 };

const CLOSED = { show: false, sticky: false, snap: 90, anchor: null, back: null, length: 0, reach: 0, toggle: null, rotate: false };

const arc = (angle, toward) => Math.abs(((angle - toward + 540) % 360) - 180);

const free = (value, length, grid) => clamp(grid ? snapToGrid(value, length) : value, EDGE_PADDING, length - EDGE_PADDING);

const land = (value, length, grid) => {
  const walled = snapToWall(value, length);
  return walled !== value ? walled : free(value, length, grid);
};

const onward = (value, length, velocity, shown) => {
  const walled = snapToWall(value, length, velocity);
  return walled !== value ? walled : shown;
};

const sample = (event) => ({ x: event.clientX, y: event.clientY, time: event.timeStamp });

const velocity = (trail) => {
  const first = trail[0];
  const last = trail.at(-1);
  const span = last.time - first.time;
  return span > 0 ? { x: (last.x - first.x) / span, y: (last.y - first.y) / span } : { x: 0, y: 0 };
};

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
      trail: [],
      walls: { x: null, y: null },
      tapCount: 0,
      tapTimer: null,
      longPressTimer: null,
      homing: null,
      dozeTimer: null,
    };
    this.$dragging = atom(false);
    this.$longPress = atom(false);
    this.$fromSticky = atom(false);
    this.$radial = atom(CLOSED);
    this.$flash = atom(null);
    this.$hidden = atom(false);
    this.$autoHide = atom(true);
  }

  get dragging() { return this.$dragging.get(); }
  get longPress() { return this.$longPress.get(); }
  get radial() { return this.$radial.get(); }
  get flash() { return this.$flash.get(); }
  get hidden() { return this.$hidden.get(); }

  reset() {
    clearTimeout(this.state.longPressTimer);
    clearTimeout(this.state.tapTimer);
    clearTimeout(this.state.dozeTimer);
    this.state.pointerId = null;
    this.state.tapCount = 0;
    this.state.homing = null;
    this.$dragging.set(false);
    this.$longPress.set(false);
    this.$fromSticky.set(false);
    this.$hidden.set(false);
    this.$radial.set(CLOSED);
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
    this.state.trail = [sample(event)];
    this.state.walls = { x: null, y: null };
    this.$dragging.set(false);
    this.$longPress.set(false);
    this.$fromSticky.set(this.$radial.get().sticky);

    clearTimeout(this.state.longPressTimer);
    this.state.longPressTimer = setTimeout(() => {
      if (this.$dragging.get()) return;
      this.$longPress.set(true);
      this.open();
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8);
    }, LONG_PRESS_MS);
  };

  move = (event) => {
    if (this.state.pointerId !== event.pointerId) return;
    this.track(event);
    const viewport = this.layout.$viewport.get();
    const deltaX = event.clientX - this.state.downX;
    const deltaY = event.clientY - this.state.downY;
    const distance = Math.hypot(deltaX, deltaY);

    if (this.$longPress.get()) {
      this.pull(event);
      return;
    }

    if (!this.$dragging.get() && distance > TAP_MAX_MOVE) {
      clearTimeout(this.state.longPressTimer);
      this.$dragging.set(true);
      if (this.$fromSticky.get()) {
        this.$radial.set(CLOSED);
        this.$fromSticky.set(false);
      }
    }

    if (this.$dragging.get() && !this.layout.$locked.get()) {
      this.layout.pincer = {
        x: this.approach("x", this.state.startPincerX + deltaX, viewport.width),
        y: this.approach("y", this.state.startPincerY + deltaY, viewport.height),
      };
    }
  };

  track(event) {
    const now = sample(event);
    this.state.trail = [...this.state.trail.filter((held) => now.time - held.time <= VELOCITY_WINDOW), now];
  }

  approach(axis, value, length) {
    const now = this.state.trail.at(-1);
    const wall = snapToWall(value, length, velocity(this.state.trail)[axis]);
    const held = this.state.walls[axis];
    const caught = wall === value ? null : held?.wall === wall ? held : { wall, since: now.time };
    this.state.walls[axis] = caught;
    return caught && now.time - caught.since >= WALL_ONSET ? wall : free(value, length, this.view.$snap.get());
  }

  fling(event) {
    this.track(event);
    const viewport = this.layout.$viewport.get();
    const pincer = this.layout.$pincer.get();
    const pace = velocity(this.state.trail);
    this.layout.pincer = {
      x: onward(this.state.startPincerX + event.clientX - this.state.downX, viewport.width, pace.x, pincer.x),
      y: onward(this.state.startPincerY + event.clientY - this.state.downY, viewport.height, pace.y, pincer.y),
    };
  }

  up = (event) => {
    if (this.state.pointerId !== event.pointerId) return;
    clearTimeout(this.state.longPressTimer);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (_) {}
    this.state.pointerId = null;

    if (this.$longPress.get()) {
      this.$longPress.set(false);
      this.release(event);
      return;
    }

    if (this.$dragging.get()) {
      this.$dragging.set(false);
      if (this.layout.$locked.get()) return;
      this.fling(event);
      this.layout.previous = { x: this.state.startPincerX, y: this.state.startPincerY, orientation: this.layout.$orientation.get() };
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
    if (this.layout.$locked.get()) {
      this.pulse("tap3");
      return;
    }
    if (this.view.$full.get()) {
      if (count === 1) this.view.full = false;
      else this.$autoHide.set(!this.$autoHide.get());
      this.$hidden.set(false);
      return;
    }
    if (count === 1) this.place(this.layout.$standard.get(), "tap1");
    else if (count === 2) this.place(this.layout.$previous.get(), "tap2");
    else {
      this.layout.standard = this.placement();
      this.pulse("tap3");
    }
    this.bridge.save();
  }

  placement() {
    return { ...this.layout.$pincer.get(), orientation: this.layout.$orientation.get() };
  }

  place(target, flash) {
    this.layout.previous = this.placement();
    this.layout.pincer = { x: target.x, y: target.y };
    this.layout.orientation = target.orientation;
    this.pulse(flash);
  }

  seek() {
    if (this.layout.$locked.get()) {
      this.pulse("tap3");
      return;
    }
    this.place(this.layout.$standard.get(), "tap1");
    this.bridge.save();
  }

  pulse(kind) {
    this.$flash.set(kind);
    setTimeout(() => this.$flash.set(null), FLASH_DURATION_MS);
  }

  open() {
    const pincer = this.layout.$pincer.get();
    const orientation = this.layout.$orientation.get();
    this.$hidden.set(false);
    this.$radial.set({
      ...CLOSED,
      show: true,
      snap: orientationToSnap(orientation),
      anchor: { x: pincer.x, y: pincer.y + this.bridge.$viewportOffsetTop.get() },
      back: { pincer, orientation },
    });
  }

  restore(back) {
    this.layout.orientation = back.orientation;
    this.layout.pincer = back.pincer;
  }

  pull(event) {
    const radial = this.$radial.get();
    const vectorX = event.clientX - radial.anchor.x;
    const vectorY = event.clientY - radial.anchor.y;
    const length = Math.hypot(vectorX, vectorY);
    const angle = ((Math.atan2(vectorY, vectorX) * 180) / Math.PI + 360) % 360;
    const reachable = length > TOGGLE_REACH.from && length < TOGGLE_REACH.to;
    const toggle = (reachable && Object.keys(TOGGLES).find((name) => arc(angle, TOGGLES[name]) < TOGGLE_ARC)) || null;
    if (length < DEAD_ZONE || toggle || this.layout.$locked.get()) {
      this.restore(radial.back);
      this.$radial.set({ ...radial, snap: orientationToSnap(radial.back.orientation), length, reach: 0, toggle, rotate: false });
      return;
    }
    const snap = (Math.round(angle / 90) * 90) % 360;
    const beyond = length - RING;
    const band = radial.rotate ? HELD_BAND : BAND;
    const rotate = beyond > 0 ? beyond <= band.out : -beyond <= band.in;
    const reach = rotate ? 0 : Math.sign(beyond) * Math.max(0, Math.abs(beyond) - (beyond > 0 ? BAND.out : BAND.in));
    const orientation = snapToOrientation(snap);
    this.layout.orientation = orientation;
    this.layout.pincer = this.stretch(orientation, reach, radial.back.pincer);
    this.$radial.set({ ...radial, snap, length, reach, toggle: null, rotate });
  }

  release(event) {
    const radial = this.$radial.get();
    if (event.type === "pointercancel") {
      this.restore(radial.back);
      this.$radial.set(CLOSED);
      return;
    }
    if (radial.toggle) {
      this.$radial.set(CLOSED);
      this.bridge.toggle(radial.toggle);
      this.bridge.save();
      return;
    }
    if (radial.length < DEAD_ZONE) {
      this.restore(radial.back);
      this.$radial.set({ ...radial, sticky: true, toggle: null, rotate: false });
      return;
    }
    this.$radial.set(CLOSED);
    this.bridge.save();
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
  }

  stretch(orientation, reach, from) {
    if (reach === 0) return from;
    const viewport = this.layout.$viewport.get();
    const vertical = orientation === 0 || orientation === 180;
    const sign = orientation === 0 || orientation === 90 ? 1 : -1;
    const length = vertical ? viewport.height : viewport.width;
    const position = (vertical ? from.y : from.x) - HALF;
    const room = length - BONE_THICKNESS;
    const forward = sign > 0 ? room - position : position;
    const backward = sign > 0 ? position : room - position;
    const travel = reach > 0
      ? Math.min(forward, reach * Math.max(1, forward / SPAN_OUT))
      : -Math.min(backward, -reach * Math.max(1, backward / SPAN_IN));
    const landed = land(position + sign * travel + HALF, length, this.view.$snap.get());
    return vertical ? { x: from.x, y: landed } : { x: landed, y: from.y };
  }

  turned(orientation) {
    const pincer = this.layout.$pincer.get();
    const { width, height } = this.layout.$viewport.get();
    const share = {
      0: (pincer.y - HALF) / height,
      90: (pincer.x - HALF) / width,
      180: (height - pincer.y - HALF) / height,
      270: (width - pincer.x - HALF) / width,
    }[this.layout.$orientation.get()];
    const axis = {
      0: share * height + HALF,
      90: share * width + HALF,
      180: height - HALF - share * height,
      270: width - HALF - share * width,
    }[orientation];
    const vertical = orientation === 0 || orientation === 180;
    const landed = land(axis, vertical ? height : width, false);
    return vertical ? { x: pincer.x, y: landed } : { x: landed, y: pincer.y };
  }

  preview(angle) {
    const radial = this.$radial.get();
    const orientation = snapToOrientation(angle);
    if (radial.sticky) return this.turned(orientation);
    return this.stretch(orientation, radial.reach, radial.back?.pincer ?? this.layout.$pincer.get());
  }

  spoke = (event, angle) => {
    event.stopPropagation();
    if (!this.$radial.get().sticky || this.layout.$locked.get()) return;
    const orientation = snapToOrientation(angle);
    this.layout.pincer = this.turned(orientation);
    this.layout.orientation = orientation;
    this.$radial.set(CLOSED);
    this.bridge.save();
  };

  tile = (event, name) => {
    event.stopPropagation();
    if (!this.$radial.get().sticky) return;
    this.$radial.set(CLOSED);
    this.bridge.toggle(name);
    this.bridge.save();
  };

  lock = (event) => {
    event.stopPropagation();
    if (!this.$radial.get().sticky) return;
    this.$radial.set(CLOSED);
    this.layout.locked = !this.layout.$locked.get();
    this.bridge.save();
  };

  homeDown = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (!this.$radial.get().sticky) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    this.state.homing = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, from: this.layout.$standard.get(), moved: false };
  };

  homeMove = (event) => {
    const homing = this.state.homing;
    if (!homing || homing.pointerId !== event.pointerId) return;
    if (!homing.moved && Math.hypot(event.clientX - homing.x, event.clientY - homing.y) <= TAP_MAX_MOVE) return;
    homing.moved = true;
    const viewport = this.layout.$viewport.get();
    this.layout.standard = {
      ...homing.from,
      x: clamp(homing.from.x + event.clientX - homing.x, EDGE_PADDING, viewport.width - EDGE_PADDING),
      y: clamp(homing.from.y + event.clientY - homing.y, EDGE_PADDING, viewport.height - EDGE_PADDING),
    };
  };

  homeUp = (event) => {
    const homing = this.state.homing;
    if (!homing || homing.pointerId !== event.pointerId) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (_) {}
    this.state.homing = null;
    if (!homing.moved) {
      this.$radial.set(CLOSED);
      this.seek();
      return;
    }
    const viewport = this.layout.$viewport.get();
    const standard = this.layout.$standard.get();
    const grid = this.view.$snap.get();
    this.layout.standard = {
      ...standard,
      x: land(standard.x, viewport.width, grid),
      y: land(standard.y, viewport.height, grid),
    };
    this.bridge.save();
  };

  backdrop = () => {
    this.$radial.set(CLOSED);
  };

  sense = (event) => {
    if (!this.view.$full.get()) return;
    const pincer = this.layout.$pincer.get();
    const near = Math.hypot(event.clientX - pincer.x, event.clientY - pincer.y - this.bridge.$viewportOffsetTop.get()) <= NEAR;
    const touch = event.pointerType !== "mouse";
    clearTimeout(this.state.dozeTimer);
    if (near) this.$hidden.set(false);
    if (near && !touch) return;
    this.doze(touch ? DOZE.touch : DOZE.mouse);
  };

  doze(after = DOZE.mouse) {
    clearTimeout(this.state.dozeTimer);
    this.state.dozeTimer = setTimeout(() => {
      if (this.view.$full.get() && this.$autoHide.get() && !this.$dragging.get() && !this.$radial.get().show) this.$hidden.set(true);
    }, after);
  }

  wake() {
    clearTimeout(this.state.dozeTimer);
    this.$hidden.set(false);
  }
}
