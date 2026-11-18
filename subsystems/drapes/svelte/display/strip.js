export const GAP = 6;
export const PAD = 12;
export const SHORT = 3;
export const ICON = 26;
export const ARROWS = 64;
export const TAIL = 56;
export const ZOOM_FLOOR = 0.8;
export const PAGE_FLOOR = 3;

const sum = (widths) => widths.reduce((total, width) => total + width, 0);
const span = (widths, fold) => sum(widths) + GAP * widths.length + fold;

const paginate = (widths, room) => {
  for (let count = 2; count <= widths.length; count++) {
    const size = Math.ceil(widths.length / count);
    if (size < PAGE_FLOOR) return null;
    const pages = [];
    for (let from = 0; from < widths.length; from += size) pages.push([from, Math.min(widths.length, from + size)]);
    if (pages.every(([from, to]) => sum(widths.slice(from, to)) + GAP * (to - from - 1) <= room)) return pages;
  }
  return null;
};

export const fit = ({ width, full, short, fold, stacked = false, active = 0 }) => {
  const room = width - PAD;
  if (span(full, fold) <= room) return { mode: "row", labels: "full", zoom: 1 };
  if (span(short, ICON) <= room) return { mode: "row", labels: "short", zoom: 1 };
  const zoom = room / span(short, ICON);
  if (zoom >= ZOOM_FLOOR) return { mode: "row", labels: "short", zoom };
  if (stacked) return { mode: "rail", labels: "short", zoom: 1 };
  const pages = paginate(short, room - ARROWS - TAIL);
  if (pages) return { mode: "pages", labels: "short", zoom: 1, pages, page: Math.max(0, pages.findIndex(([from, to]) => active >= from && active < to)) };
  return { mode: "merged", labels: "full", zoom: 1 };
};
