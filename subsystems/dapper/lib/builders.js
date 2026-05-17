// ============================================================================
// Skeleton builders.
//
// Pure, composable factories for assembling a flat scoped skeleton from a few
// hand-picked anchors. See .ikiro/pincer.quest.org § Dapper Skeleton
// Rebuild for the model.
//
// The contract:
//   - structural roles (surface/contrast/boundary) are passed as raw values
//   - interactive roles ({primary, secondary, accent, info, success, warning,
//     danger}) are passed as { ramp, anchor }; the builder fans out
//     { base, hover, active } by walking the ramp ±1 stop
//   - error is a box: { ramp, anchors: [surface, contrast, boundary] }
//   - font is a passthrough tokenspace
// ============================================================================

// pick — read a value from a ramp at an anchor, optionally piped through
// middlewares. middlewares: (value, ramp, anchor) => value.
// Reserved for future transforms (gamma, tint, contrast boost, etc.).
export const pick = (ramp, anchor, ...middlewares) =>
  middlewares.reduce((value, mw) => mw(value, ramp, anchor), ramp[anchor]);

// interactive — fan out { base, hover, active } by walking sorted ramp keys.
// Robust to non-uniform stop spacing (e.g. ..., 800, 850, 900, ...).
// hover = one stop lighter; active = one stop darker. Edges clamp.
export const interactive = (ramp, anchor) => {
  const stops = Object.keys(ramp)
    .map(Number)
    .filter((stop) => Number.isFinite(stop))
    .sort((a, b) => a - b);
  const index = stops.indexOf(anchor);
  if (index === -1) {
    throw new Error(
      `interactive: anchor ${anchor} not found in ramp stops [${stops.join(", ")}]`,
    );
  }
  const lighter = stops[Math.max(0, index - 1)];
  const darker = stops[Math.min(stops.length - 1, index + 1)];
  return {
    base:   ramp[anchor],
    hover:  ramp[lighter],
    active: ramp[darker],
  };
};

// box — fan out a {surface, contrast, boundary} triplet from a single ramp.
// Used by error roles. Default anchors are tuned for dark-mode error boxes.
export const box = (ramp, anchors = [800, 100, 300]) => ({
  surface:  ramp[anchors[0]],
  contrast: ramp[anchors[1]],
  boundary: ramp[anchors[2]],
});

// skeleton — assemble one full skeleton from a small config object.
//
// config:
//   {
//     surface, contrast, boundary,           // structural raw values
//     roles: {                               // interactive role anchors
//       primary:   { ramp, anchor },
//       secondary: { ramp, anchor },
//       ...
//     },
//     error: { ramp, anchors },              // error box config
//     font: { heading, body, code },         // font tokenspace passthrough
//   }
export const skeleton = (config) => {
  const { surface, contrast, boundary, roles = {}, error, font } = config;
  const result = { surface, contrast, boundary };
  for (const [name, spec] of Object.entries(roles)) {
    result[name] = interactive(spec.ramp, spec.anchor);
  }
  if (error) result.error = box(error.ramp, error.anchors);
  if (font) result.font = font;
  return result;
};
