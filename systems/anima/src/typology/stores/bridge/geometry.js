export const BONE_THICKNESS = 45;
export const HAIRLINE = 4;
export const PINCER_SIZE = BONE_THICKNESS;
export const HALF = BONE_THICKNESS / 2;
export const EDGE_PADDING = HALF;

const SNAP_DOMINANT = [0, 50, 100];
const SNAP_SECONDARY = [13, 21, 34, 66, 79, 87];
export const SNAP_PERCENTS = [...SNAP_DOMINANT, ...SNAP_SECONDARY].sort((a, b) => a - b);
export const SNAP_DISTANCE = 28;
export const WALL_SNAP = 0.1;

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

export function snapToWall(value, axisLength) {
  const reach = axisLength * WALL_SNAP;
  if (value - EDGE_PADDING < reach) return EDGE_PADDING;
  if (axisLength - EDGE_PADDING - value < reach) return axisLength - EDGE_PADDING;
  return value;
}

export function snapToOrientation(snapAngle) {
  return { 0: 90, 90: 0, 180: 270, 270: 180 }[snapAngle] ?? 0;
}

export function orientationToSnap(currentOrientation) {
  return { 0: 90, 90: 0, 180: 270, 270: 180 }[currentOrientation] ?? 90;
}

export function snapLabel(angle) {
  return { 0: "→", 90: "↓", 180: "←", 270: "↑" }[angle] ?? "";
}

export const A_SIDE = { 0: "top", 90: "left", 180: "bottom", 270: "right" };

export function axisFor(rect) {
  return rect.width === BONE_THICKNESS && rect.height !== BONE_THICKNESS ? "column" : "row";
}

export function rectsForOrientation(orientation, pincer, viewportWidth, viewportHeight, thickness = BONE_THICKNESS) {
  const half = thickness / 2;
  if (orientation === 0) {
    return {
      a: { left: 0, top: 0, width: viewportWidth, height: Math.max(0, pincer.y - half) },
      b: {
        left: 0,
        top: pincer.y + half,
        width: Math.max(0, pincer.x - half),
        height: Math.max(0, viewportHeight - pincer.y - half),
      },
      c: {
        left: pincer.x + half,
        top: pincer.y + half,
        width: Math.max(0, viewportWidth - pincer.x - half),
        height: Math.max(0, viewportHeight - pincer.y - half),
      },
    };
  }
  if (orientation === 90) {
    return {
      a: { left: 0, top: 0, width: Math.max(0, pincer.x - half), height: viewportHeight },
      b: {
        left: pincer.x + half,
        top: 0,
        width: Math.max(0, viewportWidth - pincer.x - half),
        height: Math.max(0, pincer.y - half),
      },
      c: {
        left: pincer.x + half,
        top: pincer.y + half,
        width: Math.max(0, viewportWidth - pincer.x - half),
        height: Math.max(0, viewportHeight - pincer.y - half),
      },
    };
  }
  if (orientation === 180) {
    return {
      a: {
        left: 0,
        top: pincer.y + half,
        width: viewportWidth,
        height: Math.max(0, viewportHeight - pincer.y - half),
      },
      b: {
        left: pincer.x + half,
        top: 0,
        width: Math.max(0, viewportWidth - pincer.x - half),
        height: Math.max(0, pincer.y - half),
      },
      c: {
        left: 0,
        top: 0,
        width: Math.max(0, pincer.x - half),
        height: Math.max(0, pincer.y - half),
      },
    };
  }
  if (orientation === 270) {
    return {
      a: {
        left: pincer.x + half,
        top: 0,
        width: Math.max(0, viewportWidth - pincer.x - half),
        height: viewportHeight,
      },
      b: {
        left: 0,
        top: 0,
        width: Math.max(0, pincer.x - half),
        height: Math.max(0, pincer.y - half),
      },
      c: {
        left: 0,
        top: pincer.y + half,
        width: Math.max(0, pincer.x - half),
        height: Math.max(0, viewportHeight - pincer.y - half),
      },
    };
  }
}

export function bonesForOrientation(orientation, pincer, viewportWidth, viewportHeight, thickness = BONE_THICKNESS) {
  const half = thickness / 2;
  if (orientation === 0) {
    return {
      shoulder: {
        left: 0,
        top: pincer.y - half,
        width: Math.max(0, pincer.x - half),
        height: thickness,
      },
      crown: {
        left: pincer.x + half,
        top: pincer.y - half,
        width: Math.max(0, viewportWidth - pincer.x - half),
        height: thickness,
      },
      pincer: {
        left: pincer.x - half,
        top: pincer.y - half,
        width: thickness,
        height: thickness,
      },
      spine: {
        left: pincer.x - half,
        top: pincer.y + half,
        width: thickness,
        height: Math.max(0, viewportHeight - pincer.y - half),
      },
    };
  }
  if (orientation === 90) {
    return {
      shoulder: {
        left: pincer.x - half,
        top: 0,
        width: thickness,
        height: Math.max(0, pincer.y - half),
      },
      crown: {
        left: pincer.x - half,
        top: pincer.y + half,
        width: thickness,
        height: Math.max(0, viewportHeight - pincer.y - half),
      },
      pincer: {
        left: pincer.x - half,
        top: pincer.y - half,
        width: thickness,
        height: thickness,
      },
      spine: {
        left: pincer.x + half,
        top: pincer.y - half,
        width: Math.max(0, viewportWidth - pincer.x - half),
        height: thickness,
      },
    };
  }
  if (orientation === 180) {
    return {
      shoulder: {
        left: pincer.x + half,
        top: pincer.y - half,
        width: Math.max(0, viewportWidth - pincer.x - half),
        height: thickness,
      },
      crown: {
        left: 0,
        top: pincer.y - half,
        width: Math.max(0, pincer.x - half),
        height: thickness,
      },
      pincer: {
        left: pincer.x - half,
        top: pincer.y - half,
        width: thickness,
        height: thickness,
      },
      spine: {
        left: pincer.x - half,
        top: 0,
        width: thickness,
        height: Math.max(0, pincer.y - half),
      },
    };
  }
  if (orientation === 270) {
    return {
      shoulder: {
        left: pincer.x - half,
        top: pincer.y + half,
        width: thickness,
        height: Math.max(0, viewportHeight - pincer.y - half),
      },
      crown: {
        left: pincer.x - half,
        top: 0,
        width: thickness,
        height: Math.max(0, pincer.y - half),
      },
      pincer: {
        left: pincer.x - half,
        top: pincer.y - half,
        width: thickness,
        height: thickness,
      },
      spine: {
        left: 0,
        top: pincer.y - half,
        width: Math.max(0, pincer.x - half),
        height: thickness,
      },
    };
  }
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

export function isDeviceRotation(layout) {
  if (typeof window === "undefined") return false;
  const current = layout.$viewport.get();
  return window.innerWidth !== current.width || window.innerHeight !== current.height;
}
