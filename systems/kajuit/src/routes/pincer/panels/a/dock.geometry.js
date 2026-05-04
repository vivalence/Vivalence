export const DOCK_SIDES = ["top", "right", "bottom", "left"];
export const SHARE_MIN = 0.18;
export const SHARE_MAX = 1.0;
export const SHARE_DEFAULT = 0.32;

export function clampShare(share) {
  if (!Number.isFinite(share)) return SHARE_DEFAULT;
  return Math.max(SHARE_MIN, Math.min(SHARE_MAX, share));
}

export function normalizeSide(side) {
  return DOCK_SIDES.includes(side) ? side : "right";
}

export function isVertical(side) {
  return side === "left" || side === "right";
}

export function flexDirection(side) {
  if (side === "right") return "row";
  if (side === "left") return "row-reverse";
  if (side === "bottom") return "column";
  if (side === "top") return "column-reverse";
  return "row";
}

export function dragSign(side) {
  return side === "right" || side === "bottom" ? -1 : 1;
}

export function resolve(dock, rect) {
  const side = normalizeSide(dock?.side);
  const vertical = isVertical(side);
  const share = clampShare(dock?.share ?? SHARE_DEFAULT);
  const direction = flexDirection(side);
  const dimension = vertical ? rect.width : rect.height;
  const size = Math.round(dimension * share);
  return { side, vertical, share, direction, dimension, size };
}

export function shareAfterDrag({ side, share, rect, deltaPx }) {
  const vertical = isVertical(side);
  const total = vertical ? rect.width : rect.height;
  if (!total) return share;
  return clampShare(share + (dragSign(side) * deltaPx) / total);
}

export function defaultDock() {
  return { side: "right", share: SHARE_DEFAULT };
}
