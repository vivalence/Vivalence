export const WIDGETS = ["terminals", "buffers", "harness", "dock"];
export const GAP = 8;
export const PAD = 16;

export const room = (rect, axis) => (axis === "column" ? rect.height : rect.width) - PAD * 2;

export const flow = ({ names, sizes, room, gap = GAP }) =>
  names.reduce(
    (held, name) => {
      const next = held.used + (held.shoulder.length ? gap : 0) + (sizes[name] ?? 0);
      return held.crown.length || next > room
        ? { ...held, crown: [...held.crown, name] }
        : { ...held, shoulder: [...held.shoulder, name], used: next };
    },
    { shoulder: [], crown: [], used: 0 },
  );
