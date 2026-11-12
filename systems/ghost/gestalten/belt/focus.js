export const back = (bridge) => {
  const history = bridge.focusHistory;
  if (history.length === 0) return;
  bridge.$focus.set(history.at(-1));
  bridge.$focusHistory.set(history.slice(0, -1));
};
