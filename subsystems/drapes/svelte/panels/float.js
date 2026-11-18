export const GAP = 8;
export const MARGIN = 6;

const clamp = (value, size, limit) => Math.max(MARGIN, Math.min(value, limit - MARGIN - size));

export const place = (anchor, size, viewport, side = "below") => {
  const beside = anchor.right + GAP + size.width > viewport.width - MARGIN ? anchor.left - GAP - size.width : anchor.right + GAP;
  const wanted = side === "above"
    ? { left: anchor.left, top: anchor.top - GAP - size.height }
    : side === "after"
    ? { left: beside, top: anchor.top }
    : { left: anchor.left, top: anchor.bottom + GAP };
  return { left: clamp(wanted.left, size.width, viewport.width), top: clamp(wanted.top, size.height, viewport.height) };
};
