export const TAP = 260;
export const HOLD = 420;

export const gesture = (emit) => {
  let tapping = null;
  let holding = null;
  return {
    down: () => {
      holding = setTimeout(() => {
        holding = null;
        clearTimeout(tapping);
        tapping = null;
        emit("hold");
      }, HOLD);
    },
    up: () => {
      if (holding === null) return;
      clearTimeout(holding);
      holding = null;
      if (tapping !== null) {
        clearTimeout(tapping);
        tapping = null;
        return emit("double");
      }
      tapping = setTimeout(() => {
        tapping = null;
        emit("click");
      }, TAP);
    },
  };
};
