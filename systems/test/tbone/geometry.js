export const PINCER_W = 5;
export const PINCER_H = 3;
export const PINCER_LEFT = 2;
export const PINCER_RIGHT = 2;

export function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function clampPincer(pincer, cols, rows) {
  return {
    col: clamp(pincer.col, PINCER_LEFT + 1, cols - PINCER_RIGHT - 2),
    row: clamp(pincer.row, 2, rows - 4),
  };
}

export function rects(pincer, cols, rows) {
  return {
    a: { left: 0, top: 0, width: cols, height: pincer.row },
    b: {
      left: 0,
      top: pincer.row + 1,
      width: Math.max(0, pincer.col - PINCER_LEFT + 1),
      height: Math.max(0, rows - pincer.row - 1),
    },
    c: {
      left: pincer.col + PINCER_RIGHT,
      top: pincer.row + 1,
      width: Math.max(0, cols - pincer.col - PINCER_RIGHT),
      height: Math.max(0, rows - pincer.row - 1),
    },
  };
}

export function bones(pincer, cols, rows) {
  return {
    shoulder: {
      left: 0,
      top: pincer.row,
      width: Math.max(0, pincer.col - PINCER_LEFT),
      height: 1,
    },
    crown: {
      left: pincer.col + PINCER_RIGHT + 1,
      top: pincer.row,
      width: Math.max(0, cols - pincer.col - PINCER_RIGHT - 1),
      height: 1,
    },
    spine: {
      left: pincer.col - PINCER_LEFT,
      top: pincer.row + 2,
      width: PINCER_W,
      height: Math.max(0, rows - pincer.row - 2),
    },
    keystone: {
      left: pincer.col - PINCER_LEFT,
      top: pincer.row - 1,
      width: PINCER_W,
      height: PINCER_H,
    },
  };
}

export function hit(x, y, rect) {
  return (
    x >= rect.left &&
    x < rect.left + rect.width &&
    y >= rect.top &&
    y < rect.top + rect.height
  );
}
