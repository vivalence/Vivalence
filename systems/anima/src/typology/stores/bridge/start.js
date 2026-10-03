import { EDGE_PADDING, HALF, clamp } from "./geometry.js";

export const SCREENS = { phone: 600, tablet: 1100 };

export function screenOf({ width, height }) {
  if (width < SCREENS.phone) return "phone";
  if (width < SCREENS.tablet || height > width) return "tablet";
  return "desk";
}

const inside = (value, length) => clamp(value, EDGE_PADDING, length - EDGE_PADDING);

const PLACEMENTS = {
  desk: ({ width, height }) => ({
    pincer: { x: inside(400 + HALF, width), y: HALF },
    orientation: 270,
    fold: "free",
    standard: { x: HALF, y: height / 2, orientation: 270 },
  }),
  tablet: ({ width, height }) => ({
    pincer: { x: HALF, y: height / 2 },
    orientation: 0,
    fold: "page",
    standard: { x: width / 2, y: height - HALF, orientation: 0 },
  }),
  phone: ({ width, height }) => ({
    pincer: { x: HALF, y: inside(300 + HALF, height) },
    orientation: 180,
    fold: "page",
    standard: { x: width / 2, y: HALF, orientation: 180 },
  }),
};

export function startFor(viewport) {
  const screen = screenOf(viewport);
  return { screen, ...PLACEMENTS[screen](viewport) };
}
